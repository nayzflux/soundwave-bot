import React from "react";
import {useRouter} from "next/navigation";

const Unauthenticated = () => {
    const router = useRouter();

    return (
        <div className="flex flex-grow justify-center items-center flex-col space-y-4 cursor-default">
            <p className="text-xl font-bold">You're currently not logged in!</p>

            <p className="text-lg text-center ">
                Login with discord to start using dashboard
            </p>

            <button className="hover:shadow-2xl bg-blue-600 hover:shadow-blue-500 px-3 py-2 rounded-lg font-semibold active:scale-95 transition-all ease-out duration-700" onClick={() => router.push((process.env.NEXT_PUBLIC_API_URL || 'https://api.soundwave.nayz.fr/api') + '/auth/login')}>Login With Discord</button>
        </div>
    )
}

export default Unauthenticated;