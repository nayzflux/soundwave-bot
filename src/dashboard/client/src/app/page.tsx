import Image from 'next/image'
'use client';

import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import {RecoilRoot} from "recoil";
import Search from "@/components/Search";

export default function Home() {
  return (
    <RecoilRoot>
        <div className="flex flex-col h-screen">
            <div className="flex flex-row h-full">
                <Sidebar/>
                <Search/>
            </div>
            <Player/>
        </div>
    </RecoilRoot>
  )
}
