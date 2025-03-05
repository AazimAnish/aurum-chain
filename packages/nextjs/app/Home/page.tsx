"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import base from "../../public/base.jpg";
import greekMobile from "../../public/greekMobile.png";
import headsetGirl from "../../public/headsetGirl.png";
import { Button } from "../../~/components/ui/button";
import { motion, useAnimation } from "framer-motion";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const titleControls = useAnimation();
  const [bgColor, setBgColor] = useState("bg-yellow-400");
  const [textColor, setTextColor] = useState("text-black");

  useEffect(() => {
    const animateColors = async () => {
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setBgColor("bg-black");
        setTextColor("text-yellow-400");
        await new Promise(resolve => setTimeout(resolve, 100));
        setBgColor("bg-yellow-400");
        setTextColor("text-black");
      }
      setBgColor("bg-black");
      setTextColor("text-yellow-400");
    };

    const animateTitle = async () => {
      await titleControls.start({ scale: [1, 1.1, 0.9, 1.05, 1], transition: { duration: 0.5 } });
    };

    animateColors();
    animateTitle();
  }, [titleControls]);

  return (
    <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center`}>
      <motion.header
        className="text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0 }}
      >
        <div className="relative flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="self-start flex flex-col items-start"
          >
            <p className="text-sm text-yellow-400 italic m-0 p-0" style={{ fontFamily: "'GFS Didot', serif" }}>
              Powered by
            </p>
            <Image src={base} alt="Powered by Base" width={200} height={50} className="rounded-lg w-28" />
          </motion.div>
          <motion.h1
            animate={titleControls}
            className={`text-8xl font-bold pt-4 ${textColor}`}
            style={{
              fontFamily: "'Goldman', sans-serif",
            }}
          >
            CHRYSUS
          </motion.h1>
        </div>
        <motion.p
          className={`text-xl ${textColor} mt-4 italic font-light tracking-wide`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Because nothing says &apos;trust&apos; like onchain tracked bling ✨
        </motion.p>
        <div className="mt-8 flex justify-center gap-20">
          <Link href="/Login">
            <Button>Register The Gold</Button>
          </Link>
          <Link href="/Track">
            <Button>Track Your Gold</Button>
          </Link>
        </div>
      </motion.header>

      <motion.div
        className="absolute bottom-0 left-0 w-96 mb-4"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <Image src={greekMobile} alt="Greek Mobile" layout="responsive" objectFit="cover" />
      </motion.div>

      <motion.div
        className="absolute bottom-0 right-0 w-96 mb-4"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <Image src={headsetGirl} alt="Headset Girl" layout="responsive" objectFit="cover" />
      </motion.div>

      <motion.footer
        className="mt-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0 }}
      ></motion.footer>
    </div>
  );
};

export default Home;
