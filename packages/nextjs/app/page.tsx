"use client";

import React from "react";
import Link from "next/link";
import { 
  LockClosedIcon, 
  ShieldCheckIcon, 
  CurrencyDollarIcon, 
  ChatBubbleBottomCenterTextIcon, 
  ChartBarIcon, 
  BuildingLibraryIcon 
} from "@heroicons/react/24/outline";
import { DotPattern } from "~~/components/ui/DotPattern";
import { Button } from "~~/~/components/ui/button";
// import greekMobile from "../public/greekMobile.png";
// import headsetGirl from "../public/headsetGirl.png";
// import { motion } from "framer-motion";
// import Image from "next/image";
// import { MoveRight } from "lucide-react";

const featureItems = [
  {
    title: "Secure Registration",
    description: "Government officials can securely register gold with unique identifiers on the blockchain.",
    icon: LockClosedIcon
  },
  {
    title: "Transparent Tracking",
    description: "Anyone can verify and track gold using the registered unique ID.",
    icon: ShieldCheckIcon
  },
  {
    title: "Tax Calculation",
    description: "Automatic tax calculation based on gold holdings and government regulations.",
    icon: CurrencyDollarIcon
  },
  {
    title: "AI Assistant",
    description: "RAG-trained AI bot for answering gold and tax-related queries.",
    icon: ChatBubbleBottomCenterTextIcon
  },
  {
    title: "User Dashboard",
    description: "Track your gold holdings and tax obligations in a single dashboard.",
    icon: ChartBarIcon
  },
  {
    title: "Government Access",
    description: "Government portals to monitor gold holdings and tax compliance.",
    icon: BuildingLibraryIcon
  }
];

// Add custom styles for fonts
const CustomStyle = () => (
  <style jsx global>{`
    @import url("https://fonts.googleapis.com/css2?family=Goldman:wght@400;700&display=swap");
    @import url("https://fonts.googleapis.com/css2?family=GFS+Didot&display=swap");
    
    .goldman-font {
      font-family: "Goldman", sans-serif;
    }
    
    .didot-font {
      font-family: "GFS Didot", serif;
    }
    
    .gold-text {
      color: #ffd700;
    }
    
    .dark-bg {
      background-color: #0f0f0f;
    }
  `}</style>
);

// Custom styled components for the homepage
const CustomHero = () => {
  return (
    <div className="w-full relative">
      <DotPattern 
        width={20} 
        height={20} 
        cx={1} 
        cy={1} 
        cr={1.5} 
        className="text-yellow-400/20 absolute inset-0 z-0" 
        glow={true} 
      />
      <div className="container mx-auto relative z-10">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button variant="outline" size="lg" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
              Blockchain-Powered Gold Tracking
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular" style={{ fontFamily: "'Goldman', sans-serif" }}>
              AURUM-CHAIN
            </h1>
            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              The revolutionary blockchain platform for transparent gold tracking, ownership verification, and simplified tax management. Connecting users, businesses, and government for complete transparency.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Link href="/Login" legacyBehavior passHref>
              <Button variant="outline" size="lg" className="border-black text-black hover:bg-gray-50">
                Register Gold
              </Button>
            </Link>
            <Link href="/Track" legacyBehavior passHref>
              <Button variant="default" size="lg" className="bg-[#ECBD45] text-black hover:bg-[#D9AD3C]">
                Track Gold
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomFeature = () => {
  return (
    <div className="w-full py-20 lg:py-32 relative">
      <div className="container mx-auto relative z-10">
        <div className="flex flex-col gap-8 lg:gap-16 relative">
          <div className="text-center">
            <Button variant="outline" size="lg" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
              Platform Features
            </Button>
          </div>
          <div className="flex gap-4 flex-col text-center max-w-3xl mx-auto">
            <h3 className="text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular goldman-font">
              Why Choose Aurum-Chain?
            </h3>
            <p className="text-lg leading-relaxed tracking-tight text-muted-foreground lg:max-w-xl mx-auto">
              Our platform provides a complete gold tracking ecosystem with unmatched security, transparency, and ease of use.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featureItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 p-6 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-yellow-100 text-yellow-900">
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-semibold">{item.title}</h4>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomCTA = () => {
  return (
    <div className="w-full py-20 lg:py-40 relative">
      <DotPattern 
        width={28} 
        height={28} 
        cx={1.5} 
        cy={1.5} 
        cr={1.25} 
        className="text-yellow-400/10 absolute inset-0 z-0" 
        glow={true}
      />
      <div className="container mx-auto relative z-10">
        <div className="flex flex-col text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-14 gap-8 items-center shadow-lg border border-gray-100">
          <div>
            <Button variant="default" size="lg" className="bg-[#ECBD45] text-black hover:bg-[#D9AD3C]">
              Get Started Today
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular goldman-font">
              Join The Gold Revolution
            </h3>
            <p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-xl">
              Experience the future of gold tracking and tax management. Our blockchain platform brings transparency, security, and efficiency to gold ownership verification.
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <Link href="/Registration" legacyBehavior passHref>
              <Button variant="outline" size="lg" className="border-black text-black hover:bg-gray-50">
                Register Gold
              </Button>
            </Link>
            <Link href="/Track" legacyBehavior passHref>
              <Button variant="default" size="lg" className="bg-[#ECBD45] text-black hover:bg-[#D9AD3C]">
                Track Gold
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="w-full min-h-screen">
      <CustomStyle />
      {/* Custom Header removed to avoid duplication with main Header component */}
      
      <main className="flex flex-col items-center justify-between">
        {/* Hero Section */}
        <CustomHero />
        
        {/* Decorative Elements */}
        {/* <div className="relative w-full">
          <motion.div
            className="absolute bottom-0 left-0 w-96 mb-4"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <Image 
              src={greekMobile} 
              alt="Greek Mobile" 
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "auto" }}
            />
          </motion.div>

          <motion.div
            className="absolute bottom-0 right-0 w-96 mb-4"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <Image 
              src={headsetGirl} 
              alt="Headset Girl" 
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "auto" }}
            />
          </motion.div>
        </div> */}

        {/* Features Section */}
        <CustomFeature />
        
        {/* Call To Action */}
        <CustomCTA />
      </main>

      {/* <footer className="w-full py-8 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span className="font-bold">© 2023 Aurum-Chain</span>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground">Privacy Policy</Link>
              <Link href="#" className="text-sm text-muted-foreground">Terms of Service</Link>
              <Link href="#" className="text-sm text-muted-foreground">Contact</Link>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default Home;