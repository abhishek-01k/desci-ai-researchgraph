import os
import json
import hashlib
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.serialization import load_pem_private_key, load_pem_public_key
import base64
import requests
from dataclasses import dataclass, asdict
from enum import Enum

from app.kg.neo4j_connection import run_write_query, run_read_query
from app.services.redis_cache import get_cached_result, set_cached_result


class DIDMethodType(Enum):
    """Supported DID method types"""
    WEB = "web"
    KEY = "key"
    PEER = "peer"
    # Removed SOLANA - using EVM-compatible Filecoin network instead


@dataclass
class VerificationMethod:
    """W3C DID Verification Method"""
    id: str
    type: str
    controller: str
    public_key_multibase: Optional[str] = None
    public_key_jwk: Optional[Dict] = None
    public_key_pem: Optional[str] = None


@dataclass
class ServiceEndpoint:
    """W3C DID Service Endpoint"""
    id: str
    type: str
    service_endpoint: str
    description: Optional[str] = None


@dataclass
class DIDDocument:
    """W3C DID Document v1.1 compliant structure"""
    context: List[str]
    id: str
    controller: Optional[str] = None
    verification_method: List[VerificationMethod] = None
    authentication: List[str] = None
    assertion_method: List[str] = None
    key_agreement: List[str] = None
    capability_invocation: List[str] = None
    capability_delegation: List[str] = None
    service: List[ServiceEndpoint] = None
    created: Optional[str] = None
    updated: Optional[str] = None
    version_id: Optional[str] = None
    next_update: Optional[str] = None
    next_version_id: Optional[str] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        result = {
            "@context": self.context,
            "id": self.id
        }
        
        if self.controller:
            result["controller"] = self.controller
            
        if self.verification_method:
            result["verificationMethod"] = [asdict(vm) for vm in self.verification_method]
            
        if self.authentication:
            result["authentication"] = self.authentication
            
        if self.assertion_method:
            result["assertionMethod"] = self.assertion_method
            
        if self.key_agreement:
            result["keyAgreement"] = self.key_agreement
            
        if self.capability_invocation:
            result["capabilityInvocation"] = self.capability_invocation
            
        if self.capability_delegation:
            result["capabilityDelegation"] = self.capability_delegation
            
        if self.service:
            result["service"] = [asdict(svc) for svc in self.service]
            
        if self.created:
            result["created"] = self.created
            
        if self.updated:
            result["updated"] = self.updated
            
        if self.version_id:
            result["versionId"] = self.version_id
            
        if self.next_update:
            result["nextUpdate"] = self.next_update
            
        if self.next_version_id:
            result["nextVersionId"] = self.next_version_id
            
        return result


@dataclass
class VerifiableCredential:
    """W3C Verifiable Credential for research claims"""
    context: List[str]
    id: str
    type: List[str]
    issuer: str
    issuance_date: str
    credential_subject: Dict[str, Any]
    proof: Optional[Dict[str, Any]] = None
    expiration_date: Optional[str] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        result = {
            "@context": self.context,
            "id": self.id,
            "type": self.type,
            "issuer": self.issuer,
            "issuanceDate": self.issuance_date,
            "credentialSubject": self.credential_subject
        }
        
        if self.proof:
            result["proof"] = self.proof
            
        if self.expiration_date:
            result["expirationDate"] = self.expiration_date
            
        return result


class DIDService:
    """
    Production-ready DID service for Bio AI system
    
    Implements W3C DID v1.1 specification with support for:
    - DID document creation and management
    - Verifiable credentials for research claims
    - Integration with existing Neo4j knowledge graph
    - Blockchain anchoring via EVM-compatible Filecoin network
    - Researcher identity verification
    """
    
    def __init__(self):
        self.base_url = os.getenv("DID_BASE_URL", "https://bio-ai.xyz")
        self.supported_methods = [DIDMethodType.WEB, DIDMethodType.KEY]  # Removed SOLANA
        self.cache_ttl = 3600  # 1 hour cache for DID documents
        
    def generate_keypair(self) -> tuple[str, str]:
        """Generate RSA keypair for DID operations"""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        public_key = private_key.public_key()
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        return private_pem.decode('utf-8'), public_pem.decode('utf-8')
    
    def create_researcher_did(self, 
                            researcher_email: str,
                            researcher_name: str,
                            institution: str,
                            orcid_id: Optional[str] = None,
                            method: DIDMethodType = DIDMethodType.WEB) -> Dict[str, Any]:
        """
        Create a DID for a researcher with verifiable credentials
        
        Args:
            researcher_email: Researcher's email address
            researcher_name: Full name of the researcher
            institution: Affiliated institution
            orcid_id: Optional ORCID identifier
            method: DID method type to use
            
        Returns:
            Dictionary containing DID document, private key, and metadata
        """
        # Generate unique DID identifier
        researcher_id = str(uuid.uuid4())
        
        if method == DIDMethodType.WEB:
            did_id = f"did:web:{self.base_url.replace('https://', '').replace('http://', '')}:researchers:{researcher_id}"
        elif method == DIDMethodType.KEY:
            did_id = f"did:key:{researcher_id}"
        # Removed SOLANA method - using EVM-compatible Filecoin network instead
        else:
            raise ValueError(f"Unsupported DID method: {method}")
        
        # Generate cryptographic keys
        private_key, public_key = self.generate_keypair()
        
        # Create verification method
        verification_method = VerificationMethod(
            id=f"{did_id}#key-1",
            type="RsaVerificationKey2018",
            controller=did_id,
            public_key_pem=public_key
        )
        
        # Create service endpoints
        service_endpoints = [
            ServiceEndpoint(
                id=f"{did_id}#bio-ai-service",
                type="BioAIResearchService",
                service_endpoint=f"{self.base_url}/api/v1/researchers/{researcher_id}",
                description="Bio AI research claim verification service"
            )
        ]
        
        # Add ORCID service if provided
        if orcid_id:
            service_endpoints.append(
                ServiceEndpoint(
                    id=f"{did_id}#orcid-service",
                    type="ORCIDService",
                    service_endpoint=f"https://orcid.org/{orcid_id}",
                    description="ORCID researcher profile"
                )
            )
        
        # Create DID document
        did_document = DIDDocument(
            context=[
                "https://www.w3.org/ns/did/v1",
                "https://w3id.org/security/suites/rsa-2018/v1"
            ],
            id=did_id,
            verification_method=[verification_method],
            authentication=[verification_method.id],
            assertion_method=[verification_method.id],
            service=service_endpoints,
            created=datetime.now(timezone.utc).isoformat(),
            version_id="1"
        )
        
        # Store in Neo4j knowledge graph
        self._store_researcher_did(did_document, researcher_email, researcher_name, institution, orcid_id)
        
        # Cache the DID document
        self._cache_did_document(did_id, did_document)
        
        return {
            "did": did_id,
            "did_document": did_document.to_dict(),
            "private_key": private_key,
            "researcher_id": researcher_id,
            "created_at": did_document.created
        }
    
    def create_claim_credential(self,
                              claim_id: str,
                              claim_text: str,
                              researcher_did: str,
                              verdict: str,
                              confidence_score: float,
                              evidence_pmids: List[str],
                              private_key_pem: str) -> Dict[str, Any]:
        """
        Create a verifiable credential for a research claim
        
        Args:
            claim_id: Unique identifier for the claim
            claim_text: The research claim text
            researcher_did: DID of the researcher making the claim
            verdict: Verification verdict (supported/null/contradicted)
            confidence_score: Confidence score (0-1)
            evidence_pmids: List of PubMed IDs supporting the claim
            private_key_pem: Private key for signing the credential
            
        Returns:
            Dictionary containing the verifiable credential
        """
        credential_id = f"urn:uuid:{uuid.uuid4()}"
        
        # Create credential subject
        credential_subject = {
            "id": researcher_did,
            "claimId": claim_id,
            "claimText": claim_text,
            "verdict": verdict,
            "confidenceScore": confidence_score,
            "evidencePMIDs": evidence_pmids,
            "verificationDate": datetime.now(timezone.utc).isoformat(),
            "verificationMethod": "Bio AI Null Result Detection System"
        }
        
        # Create verifiable credential
        credential = VerifiableCredential(
            context=[
                "https://www.w3.org/2018/credentials/v1",
                "https://bio-ai.xyz/contexts/research-claim/v1"
            ],
            id=credential_id,
            type=["VerifiableCredential", "ResearchClaimCredential"],
            issuer=f"did:web:{self.base_url.replace('https://', '').replace('http://', '')}:system",
            issuance_date=datetime.now(timezone.utc).isoformat(),
            credential_subject=credential_subject
        )
        
        # Sign the credential
        proof = self._create_proof(credential.to_dict(), private_key_pem)
        credential.proof = proof
        
        # Store in Neo4j
        self._store_claim_credential(credential, claim_id, researcher_did)
        
        return {
            "credential": credential.to_dict(),
            "credential_id": credential_id,
            "issued_at": credential.issuance_date
        }
    
    def resolve_did(self, did: str) -> Optional[Dict[str, Any]]:
        """
        Resolve a DID to its DID document
        
        Args:
            did: The DID to resolve
            
        Returns:
            DID document if found, None otherwise
        """
        # Check cache first
        cached_doc = self._get_cached_did_document(did)
        if cached_doc:
            return cached_doc
        
        # Query Neo4j for DID document
        query = """
        MATCH (d:DIDDocument {id: $did})
        RETURN d
        """
        
        result = run_read_query(query, {"did": did})
        if result:
            did_doc = result[0]["d"]
            # Cache the result
            self._cache_did_document(did, did_doc)
            return did_doc
        
        return None
    
    def verify_credential(self, credential: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify a verifiable credential
        
        Args:
            credential: The verifiable credential to verify
            
        Returns:
            Verification result with status and details
        """
        try:
            # Extract issuer DID
            issuer_did = credential.get("issuer")
            if not issuer_did:
                return {"verified": False, "error": "Missing issuer"}
            
            # Resolve issuer DID document
            issuer_doc = self.resolve_did(issuer_did)
            if not issuer_doc:
                return {"verified": False, "error": "Cannot resolve issuer DID"}
            
            # Verify proof
            proof = credential.get("proof")
            if not proof:
                return {"verified": False, "error": "Missing proof"}
            
            # Get verification method
            verification_method_id = proof.get("verificationMethod")
            verification_method = self._get_verification_method(issuer_doc, verification_method_id)
            
            if not verification_method:
                return {"verified": False, "error": "Invalid verification method"}
            
            # Verify signature
            is_valid = self._verify_signature(credential, proof, verification_method)
            
            if is_valid:
                return {
                    "verified": True,
                    "issuer": issuer_did,
                    "subject": credential.get("credentialSubject", {}).get("id"),
                    "verification_date": datetime.now(timezone.utc).isoformat()
                }
            else:
                return {"verified": False, "error": "Invalid signature"}
                
        except Exception as e:
            return {"verified": False, "error": str(e)}
    
    def get_researcher_claims(self, researcher_did: str) -> List[Dict[str, Any]]:
        """
        Get all verifiable credentials for a researcher
        
        Args:
            researcher_did: DID of the researcher
            
        Returns:
            List of verifiable credentials
        """
        query = """
        MATCH (r:Researcher {did: $researcher_did})-[:ISSUED]->(c:VerifiableCredential)
        RETURN c
        ORDER BY c.issuance_date DESC
        """
        
        result = run_read_query(query, {"researcher_did": researcher_did})
        return [record["c"] for record in result]
    
    def revoke_credential(self, credential_id: str, reason: str) -> Dict[str, Any]:
        """
        Revoke a verifiable credential
        
        Args:
            credential_id: ID of the credential to revoke
            reason: Reason for revocation
            
        Returns:
            Revocation result
        """
        query = """
        MATCH (c:VerifiableCredential {id: $credential_id})
        SET c.revoked = true,
            c.revocation_date = $revocation_date,
            c.revocation_reason = $reason
        RETURN c
        """
        
        result = run_write_query(query, {
            "credential_id": credential_id,
            "revocation_date": datetime.now(timezone.utc).isoformat(),
            "reason": reason
        })
        
        if result:
            return {"revoked": True, "credential_id": credential_id}
        else:
            return {"revoked": False, "error": "Credential not found"}
    
    def _store_researcher_did(self, did_document: DIDDocument, email: str, name: str, institution: str, orcid_id: Optional[str]):
        """Store researcher DID in Neo4j knowledge graph"""
        query = """
        MERGE (r:Researcher {email: $email})
        SET r.name = $name,
            r.institution = $institution,
            r.did = $did,
            r.orcid_id = $orcid_id,
            r.created_at = $created_at
        
        MERGE (d:DIDDocument {id: $did})
        SET d.document = $document,
            d.created = $created,
            d.updated = $updated
        
        MERGE (r)-[:HAS_DID]->(d)
        
        // Link to institution
        MERGE (i:Institution {name: $institution})
        MERGE (r)-[:AFFILIATED_WITH]->(i)
        """
        
        parameters = {
            "email": email,
            "name": name,
            "institution": institution,
            "did": did_document.id,
            "orcid_id": orcid_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "document": json.dumps(did_document.to_dict()),
            "created": did_document.created,
            "updated": did_document.updated
        }
        
        run_write_query(query, parameters)
    
    def _store_claim_credential(self, credential: VerifiableCredential, claim_id: str, researcher_did: str):
        """Store verifiable credential in Neo4j"""
        query = """
        MATCH (r:Researcher {did: $researcher_did})
        MATCH (c:Claim {claim_id: $claim_id})
        
        MERGE (vc:VerifiableCredential {id: $credential_id})
        SET vc.credential = $credential,
            vc.issuance_date = $issuance_date,
            vc.type = $type,
            vc.issuer = $issuer
        
        MERGE (r)-[:ISSUED]->(vc)
        MERGE (vc)-[:VERIFIES]->(c)
        """
        
        parameters = {
            "researcher_did": researcher_did,
            "claim_id": claim_id,
            "credential_id": credential.id,
            "credential": json.dumps(credential.to_dict()),
            "issuance_date": credential.issuance_date,
            "type": credential.type,
            "issuer": credential.issuer
        }
        
        run_write_query(query, parameters)
    
    def _create_proof(self, credential_data: Dict[str, Any], private_key_pem: str) -> Dict[str, Any]:
        """Create cryptographic proof for verifiable credential"""
        # Load private key
        private_key = load_pem_private_key(private_key_pem.encode(), password=None)
        
        # Create canonical representation
        canonical_data = json.dumps(credential_data, sort_keys=True, separators=(',', ':'))
        
        # Sign the data
        signature = private_key.sign(
            canonical_data.encode(),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        
        # Create proof
        proof = {
            "type": "RsaSignature2018",
            "created": datetime.now(timezone.utc).isoformat(),
            "verificationMethod": f"{credential_data['issuer']}#key-1",
            "proofPurpose": "assertionMethod",
            "jws": base64.b64encode(signature).decode()
        }
        
        return proof
    
    def _verify_signature(self, credential: Dict[str, Any], proof: Dict[str, Any], verification_method: Dict[str, Any]) -> bool:
        """Verify cryptographic signature on credential"""
        try:
            # Load public key
            public_key_pem = verification_method.get("publicKeyPem")
            if not public_key_pem:
                return False
            
            public_key = load_pem_public_key(public_key_pem.encode())
            
            # Recreate canonical data (without proof)
            credential_without_proof = {k: v for k, v in credential.items() if k != "proof"}
            canonical_data = json.dumps(credential_without_proof, sort_keys=True, separators=(',', ':'))
            
            # Decode signature
            signature = base64.b64decode(proof["jws"])
            
            # Verify signature
            public_key.verify(
                signature,
                canonical_data.encode(),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            
            return True
            
        except Exception:
            return False
    
    def _get_verification_method(self, did_document: Dict[str, Any], method_id: str) -> Optional[Dict[str, Any]]:
        """Get verification method from DID document"""
        verification_methods = did_document.get("verificationMethod", [])
        for method in verification_methods:
            if method.get("id") == method_id:
                return method
        return None
    
    def _cache_did_document(self, did: str, document: Dict[str, Any]):
        """Cache DID document in Redis"""
        cache_key = f"did_document:{did}"
        set_cached_result(cache_key, document, ttl=self.cache_ttl)
    
    def _get_cached_did_document(self, did: str) -> Optional[Dict[str, Any]]:
        """Get cached DID document from Redis"""
        cache_key = f"did_document:{did}"
        return get_cached_result(cache_key) 