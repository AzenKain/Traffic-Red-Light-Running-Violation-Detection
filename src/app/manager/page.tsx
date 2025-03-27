"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';

interface Violation {
  id: number;
  time: number;
  plate_text: string;
  vehicle_image: string;
  plate_image: string;
}

const ViolationsDashboard: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [groupedViolations, setGroupedViolations] = useState<{[key: string]: Violation[]}>();

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const response = await fetch('http://localhost:8000/violations');
        const data: Violation[] = await response.json();
        setViolations(data);

        // Nhóm vi phạm theo ngày
        const grouped = data.reduce((acc, violation) => {
          const date = format(new Date(violation.time * 1000), 'dd/MM/yyyy');
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(violation);
          return acc;
        }, {} as {[key: string]: Violation[]});

        setGroupedViolations(grouped);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      }
    };

    fetchViolations();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bảng Vi Phạm Giao Thông</h1>
      
      {groupedViolations && Object.entries(groupedViolations).map(([date, dayViolations]) => (
        <div key={date} className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Ngày: {date}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dayViolations.map(violation => (
              <div 
                key={violation.id} 
                className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Biển Số: {violation.plate_text}</span>
                  <span className="text-gray-600">
                    {format(new Date(violation.time * 1000), 'HH:mm:ss')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {violation.vehicle_image && (
                    <div>
                      <p className="text-sm mb-1">Hình Xe:</p>
                      <Image 
                        src={violation.vehicle_image} 
                        alt="Hình xe vi phạm" 
                        width={200} 
                        height={150} 
                        className="rounded-md"
                      />
                    </div>
                  )}
                  
                  {violation.plate_image && (
                    <div>
                      <p className="text-sm mb-1">Hình Biển Số:</p>
                      <Image 
                        src={violation.plate_image} 
                        alt="Hình biển số vi phạm" 
                        width={200} 
                        height={150} 
                        className="rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViolationsDashboard;