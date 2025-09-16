import type { TradeRate } from "@/types/trade";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import Link from "next/dist/client/link";
import { ArrowRight } from 'lucide-react';

export default function ProductPage() {
  // Need to replace with real data fetching logic
  // For now, using dummy data
  const dummyData: TradeRate[] = [
    {
      productName: "Product A",
      exportingFrom: "Country A",
      importingTo: "Country B",
      type: "Tariff",
      rate: 5,
      effectiveDate: new Date(),
      expirationDate: new Date(),
    },
    {
      productName: "Product B",
      exportingFrom: "Country A",
      importingTo: "Country C",
      type: "Duty",
      rate: 10,
      effectiveDate: new Date(),
      expirationDate: new Date(),
    },
    {
      productName: "Product C",
      exportingFrom: "Country B",
      importingTo: "Country A",
      type: "Tariff",
      rate: 15,
      effectiveDate: new Date(),
      expirationDate: new Date(),
    },
    {
      productName: "Product A",
      exportingFrom: "Country A",
      importingTo: "Country B",
      type: "Tariff",
      rate: 5,
      effectiveDate: new Date(),
      expirationDate: new Date(),
    },
    {
      productName: "Product B",
      exportingFrom: "Country A",
      importingTo: "Country C",
      type: "Duty",
      rate: 10,
      effectiveDate: new Date(),
      expirationDate: new Date(),
    },
    {
      productName: "Product C",
      exportingFrom: "Country B",
      importingTo: "Country A",
      type: "Tariff",
      rate: 15,
      effectiveDate: new Date(),
      expirationDate: new Date(),
    },
    {
      productName: "Product A",
      exportingFrom: "Country A",
      importingTo: "Country B",
      type: "Tariff",
      rate: 5,
      effectiveDate: new Date(),
      expirationDate: new Date(),
    },
    {
      productName: "Product B",
      exportingFrom: "Country A",
      importingTo: "Country C",
      type: "Duty",
      rate: 10,
      effectiveDate: new Date(),
      expirationDate: new Date(),
    },
    {
      productName: "Product C",
      exportingFrom: "Country B",
      importingTo: "Country A",
      type: "Tariff",
      rate: 15,
      effectiveDate: new Date(),
      expirationDate: new Date(),
    },
    {
      productName: "Product A",
      exportingFrom: "Country A",
      importingTo: "Country B",
      type: "Tariff",
      rate: 5,
      effectiveDate: new Date(),
      expirationDate: new Date(),
    },
    {
      productName: "Product B",
      exportingFrom: "Country A",
      importingTo: "Country C",
      type: "Duty",
      rate: 10,
      effectiveDate: new Date(),
      expirationDate: new Date(),
    },
    {
      productName: "Product C",
      exportingFrom: "Country B",
      importingTo: "Country A",
      type: "Tariff",
      rate: 15,
      effectiveDate: new Date(),
      expirationDate: new Date(),
    },
  ];
  return (
    <div>
      <div className="p-8 mx-auto text-center">
        <h1 className="text-2xl font-bold">Product Tariff Definition</h1>
        <h3 className="text-lg font-medium text-gray-500">
          View, manage, and define product tariffs and fees
        </h3>
      </div>
      <div className="container mx-auto">
        <DataTable columns={columns} data={dummyData} />
      </div>
      <div className="p-8 mx-auto text-center">
        <h1 className="text-2xl font-bold">Need help calculating tariffs?</h1>
        <p className="text-lg font-medium text-gray-500 mb-4">
          Our calculator can help you determine the correct tariffs and fees
          for your products.
        </p>
        <Link href="/calculator">
          Go to Calculator
          <ArrowRight className="inline-block ml-2" />
        </Link>
      </div>
    </div>
  );
}
