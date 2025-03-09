"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { ThirdwebScaffoldConnector } from "~~/components/scaffold-eth/ThirdwebScaffoldConnector";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Register Gold",
    href: "/Registration",
  },
  {
    label: "My Holdings",
    href: "/Holdings",
  },
  {
    label: "Track Gold",
    href: "/Track",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href }) => {
        const isActive = pathname === href;
        return (
          <li key={href} className="flex">
            <Link
              href={href}
              passHref
              className={`goldman-font px-4 py-2 text-sm transition-colors rounded-md ${
                isActive 
                  ? "bg-[#ECBD45] text-black font-medium" 
                  : "text-gray-700 hover:text-black hover:bg-gray-100"
              }`}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <header className="sticky top-0 w-full bg-white z-50 shadow-sm border-b border-gray-100">
      <div className="container mx-auto flex justify-between items-center py-3 px-4 sm:px-6">
        <div className="flex items-center">
          <Link href="/" passHref className="flex items-center gap-2 mr-6">
            <div className="flex relative w-10 h-10">
              <Image alt="Aurum-Chain logo" className="cursor-pointer" fill src="/logo.svg" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold leading-tight goldman-font text-gray-900">AURUM-CHAIN</span>
              <span className="text-xs text-gray-600">Gold Tracking Platform</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex">
            <ul className="flex space-x-1">
              <HeaderMenuLinks />
            </ul>
          </nav>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden" ref={burgerMenuRef}>
          <button
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-200"
            onClick={() => setIsDrawerOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
          >
            <Bars3Icon className="h-6 w-6 text-gray-700" />
          </button>
          
          {isDrawerOpen && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-md p-4 border-t border-gray-100 z-50">
              <ul className="flex flex-col space-y-2" onClick={() => setIsDrawerOpen(false)}>
                <HeaderMenuLinks />
              </ul>
            </div>
          )}
        </div>
        
        {/* Connect Button */}
        {/* <div className="flex items-center">
          <ThirdwebScaffoldConnector />
        </div> */}
          <div className="navbar-end ">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
      </div>
    </header>
  );
};
