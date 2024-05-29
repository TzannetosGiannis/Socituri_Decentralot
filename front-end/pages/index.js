import { NextSeo } from 'next-seo';
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import Goals from "@/components/Goals/Goals";
import Services from "@/components/Services/Services";
import Roadmap from "@/components/Roadmap/Roadmap";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  // TODO: Update the SEO configuration
  const seoConfig = {
    title: 'Home - Your Company Name',
    description: 'Welcome to our website. Discover our goals, services, and roadmap to learn more about what we offer.',
    openGraph: {
      title: 'Home - Your Company Name',
      description: 'Welcome to our website. Discover our goals, services, and roadmap to learn more about what we offer.',
      images: [
        {
          url: 'https://example.com/home-image.jpg',
          width: 800,
          height: 600,
          alt: 'Home Page Image',
        },
      ],
      site_name: 'Your Company Name',
    },
    additionalMetaTags: [
      {
        name: 'keywords',
        content: 'home, services, goals, roadmap, company',
      },
      {
        name: 'author',
        content: 'Your Company Name',
      },
    ],
  };

  return (
    <>
      <NextSeo {...seoConfig} />
      <Navbar />
      <Hero />
      <Goals />
      <Services />
      <Roadmap />
    </>
  );
}
