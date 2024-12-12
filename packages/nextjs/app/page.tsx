"use client";

import { useState } from "react";
import Link from "next/link";
import base from "../public/base.jpg";
import { Button } from "../~/components/ui/button";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const [bgColor, setBgColor] = useState("bg-white");
  const [textColor, setTextColor] = useState("text-black");

  return (
    <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center`}>
      <header className="text-center mb-8">
        <div className="relative flex flex-col items-center">
          
          <h1
            className={`text-8xl font-bold pt-4 ${textColor}`}
            style={{
              fontFamily: "'Goldman', sans-serif",
            }}
          >
            AURUM CHAIN
          </h1>
        </div>
        <p
          className={`text-xl ${textColor} mt-4 italic font-light tracking-wide`}
        >
          Because nothing says &apos;trust&apos; like onchain tracked bling ✨
        </p>
        <div className="mt-8 flex justify-center gap-20">
          <Link href="/Registration">
            <Button>Register The Gold</Button>
          </Link>
          <Link href="/Track">
            <Button>Track Your Gold</Button>
          </Link>
        </div>
      </header>

      <footer className="mt-16 text-center"></footer>
    </div>
  );
};

export default Home;
