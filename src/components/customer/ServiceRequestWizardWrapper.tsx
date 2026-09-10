"use client";

import React, { useState, useEffect } from "react";

export function ServiceRequestWizard() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Prevent server-side prerender execution of internal wizard state/browser components
    if (!isMounted) {
        return (
            <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
                Loading service wizard...
            </div>
        );
    }

    return (
        <div>
            {/* 
        PASTE YOUR ENTIRE ORIGINAL MULTI-STEP WIZARD JSX AND STATE LOGIC HERE 
      */}
        </div>
    );
}

export default ServiceRequestWizard;