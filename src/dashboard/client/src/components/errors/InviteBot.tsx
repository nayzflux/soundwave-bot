import React from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";

const InviteBot = () => {
    const router = useRouter();

    return (
        <div className="flex flex-grow justify-center items-center flex-col space-y-4 cursor-default">
            <p className="text-xl font-bold">SOUNDWAVE Bot isn't on your server!</p>

            <p className="text-lg text-center ">
                Invite bot to start using it
            </p>

            <button className="hover:shadow-2xl bg-blue-600 hover:shadow-blue-500 px-3 py-2 rounded-lg font-semibold active:scale-95 transition-all ease-out duration-700"><Link target="_blank" href={(process.env.NEXT_PUBLIC_BOT_URL || 'https://discord.com/oauth2/authorize?client_id=1099354786245120080&scope=bot&permissions=418796473416')}>Add to server</Link></button>
        </div>
    )
}

export default InviteBot;