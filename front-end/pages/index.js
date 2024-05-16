import Image from "next/image";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import Goals from "@/components/Goals/Goals";
import Services from "@/components/Services/Services";
import Roadmap from "@/components/Roadmap/Roadmap";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Goals />
      <Services />
      <Roadmap />
    </>
  );
}
