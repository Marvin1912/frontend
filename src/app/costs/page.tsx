"use client"

import CostInput from "@/app/costs/input/page"
import SpecialCosts from "@/app/costs/special/page";

export default function Costs() {
    return (
        <>
            <section id="cost_input">
                <div className="
                    flex justify-between items-center flex-col
                    text-center text-white
                    bg-gray-700
                    mx-5 my-10 max-w-full
                    lg:mx-20 lg:my-20 lg:px-10 lg:flex-row
                ">
                    <CostInput/>
                </div>
            </section>
            <section id="special_costs">
                <div className="
                    flex justify-between items-center flex-col
                    text-center text-white
                    bg-gray-700
                    mx-5
                    lg:mx-20 lg:my-20 lg:px-10 lg:flex-row lg:items-start
                ">
                    <SpecialCosts/>
                </div>
            </section>
        </>
    );
}
