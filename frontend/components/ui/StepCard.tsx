"use client";

import { ReactNode, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StepCardProps {
  number: number;
  icon: ReactNode;
  title: string;
  description: string;
  delay: number;
}

export default function StepCard({ number, icon, title, description, delay }: StepCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("translate-y-0", "opacity-100");
            }, delay * 1000);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  return (
    <Card 
      ref={cardRef}
      className="border border-blue-100 transform translate-y-8 opacity-0 transition-all duration-700 hover:shadow-lg"
    >
      <CardContent className="p-6 flex flex-col items-center text-center relative">
        <div className="absolute -top-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md">
          {number}
        </div>
        <div className="bg-blue-50 p-4 rounded-lg mt-6 mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}