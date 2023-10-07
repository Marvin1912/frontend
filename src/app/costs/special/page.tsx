"use client"

import {ScrollArea} from "@/components/ui/scroll-area";
import {JSX, useState} from "react";
import {SpecialCost} from "@/components/model/costs/SpecialCost";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {getSpecialCost} from "@/components/backend/BackendApi";
import {ArrowPathIcon} from '@heroicons/react/24/solid'

export default function SpecialCosts() {

    const [date, setDate] = useState<string>('');
    const [specialCosts, setSpecialCosts] = useState<SpecialCost[]>([]);

    const getElementsToScroll = (): JSX.Element[] => {
        return specialCosts
            .sort((a, b) => {
                if (a.costDate < b.costDate) {
                    return 1;
                }
                if (a.costDate > b.costDate) {
                    return -1;
                }
                return 0;
            })
            .map((specialCost) => {
                    let sum: number = 0
                    let specialCostEntries: JSX.Element[] = []
                    specialCost.entries
                        .sort((a, b) => {
                            if (a.amount < b.amount) {
                                return -1;
                            }
                            if (a.amount > b.amount) {
                                return 1;
                            }
                            return 0;
                        })
                        .forEach((value, index) => {
                            sum = sum + value.amount
                            specialCostEntries.push(
                                <div key={index} className="flex rounded-md border mb-1.5">
                                    <label className="w-3/5 text-left ml-1.5">{value.description}</label>
                                    <label className="w-2/5 text-right mr-1.5">{value.amount.toFixed(2) + ' €'}</label>
                                </div>
                            )
                        })

                    specialCostEntries.push(
                        <div key="sum"
                             className="flex rounded-md border mb-1.5 bg-red-300 hover:bg-red-600 duration-500 text-black">
                            <label className="w-3/5 text-left ml-1.5">In Summe</label>
                            <label className="w-2/5 text-right mr-1.5">{sum.toFixed(2) + ' €'}</label>
                        </div>
                    )

                    let monthName: string = new Date(specialCost.costDate).toLocaleDateString('default', {month: 'long'})
                    let year: number = new Date(specialCost.costDate).getFullYear()

                    return <div key={specialCost.costDate} className="flex flex-col">
                        <label className="font-bold text-xl mb-4">{monthName} {year}</label>
                        <>
                            {specialCostEntries}
                        </>
                    </div>
                }
            )
    }

    return <>
        <div id="special_cost_input" className="
            flex flex-col text-left text-white
            lg:my-10 lg:ml-60
        ">
            <label className="font-bold m-1">Datum: </label>
            <div className="flex">
                <Input
                    className="max-w-xs hover:bg-gray-400 duration-500 text-black m-1"
                    type="month" value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <Button
                    className="hover:bg-gray-900 text-white m-1"
                    variant="outline" onClick={_ => {
                    getSpecialCost(new Date(date)).then(value => {
                        setSpecialCosts(_ => value || [])
                    })
                }}
                >
                    <ArrowPathIcon className="h-5 w-5 text-blue-500"/>
                </Button>
            </div>
        </div>
        <div className="
                ml-0 mr-0 my-1 w-full
                lg:w-2/5 lg:my-10 lg:ml-10 lg:mr-80
            ">
            <ScrollArea className="h-96 rounded-md border text-center mx-10 my-5">
                <div className="p-1">{getElementsToScroll()}</div>
            </ScrollArea>
        </div>
    </>;
}
