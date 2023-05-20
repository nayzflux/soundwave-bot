"use client";

import {useEffect, useState} from "react";

const Progress = () => {
    const [progress, setProgress] = useState(23);

    useEffect(() => {
        const interval = setInterval(() => setProgress((old) => old >= 232 ? 0 : old +1), 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-8/12 h-2 bg-light-gray rounded-full" id="box">
            <div className={"absolute top-0 left-0 h-full bg-blue-600 rounded-full w-2/3"}>
                <div className="rounded-full bg-gray-200 absolute -top-1/2 right-0 h-4 w-4">
                </div>
            </div>
        </div>
    )
}

export default Progress