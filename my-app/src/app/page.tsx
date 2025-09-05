import Image from "next/image";
import { Button } from "@/components/ui/button";
import Feature from "@/components/feature";

export default function HomePage() {
  return (
    <div>
      <div className="relative w-full h-screen">
        <Image
          src="/images/background4.jpg"
          alt="Landing Background"
          fill
          style={{ objectFit: "cover"}}
          priority
        />
          {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          <h1 className="text-9xl font-bold mb-4 text-emerald-400 drop-shadow-lg">DutyNotFree</h1>
          <p className="text-xl mb-6 font-bold text-emerald-300 drop-shadow-md">Your onestop shop for tariff calculations</p>

          <div className="flex gap-4">
            <Button variant="default" size="lg" className="bg-amber-900">Register</Button>
            <Button variant="default" size="lg" className="bg-amber-900">Login</Button>
          </div>

          <Button variant="link" size="lg" className="text-white">Continue as Guest</Button>
        </div>

      </div>


      <section className="relative w-full bg-gray-50">
        <Feature />
      </section>

    </div>
  );
}
