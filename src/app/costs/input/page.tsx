"use client"

import {JSX, useEffect, useState} from 'react';

import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {DataTable} from "./data-table"
import {ColumnDef} from "@tanstack/react-table";
import {ScrollArea} from "@/components/ui/scroll-area";
import {DailyCost} from "@/components/model/costs/DailyCosts";
import {getDailyCostsGe, sendDailyCost} from "@/components/backend/BackendApi";

export default function CostInput() {

    const [date, setDate] = useState<string>('');
    const [amount, setAmount] = useState<number>(0);
    const [currentAmounts, setCurrentAmounts] = useState<number[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [dailyCosts, setDailyCosts] = useState<DailyCost[]>([]);

    const [refresh, setRefresh] = useState<boolean>(false);

    useEffect(() => {
        getDailyCostsGe(new Date()).then(value => {
            setDailyCosts(_ => value);
        });
    }, [refresh])

    type Cost = {
        id: number
        amount: string
    }

    const handleAddAmount = () => {
        if (amount && amount > 0) {
            setCurrentAmounts(prevAmounts => [...prevAmounts, amount]);
            setTotalAmount(totalAmount + amount)
            setAmount(0);
        }
    };

    const columns: ColumnDef<Cost>[] = [
        {
            accessorKey: "amount",
            header: () => <div className="text-center font-bold">Betrag</div>
        },
        {
            id: "button",
            cell: ({row}) => (
                <div className="text-center">
                    <Button
                        variant="outline"
                        className="bg-red-300 hover:bg-red-600 h-0.5 w-1/12"
                        onClick={() => {
                            currentAmounts.splice(row.index, 1);
                            setTotalAmount(currentAmounts.reduce((sum, amount) => sum + amount, 0))
                        }}
                    >x</Button>
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        }
    ]

    const getElementsToScroll = (): JSX.Element[] => {
        return dailyCosts
            .sort((a, b) => {
                if (a.costDate < b.costDate) {
                    return 1;
                }
                if (a.costDate > b.costDate) {
                    return -1;
                }
                return 0;
            })
            .map((dailyCost) =>
                <div key={dailyCost.costDate}
                     className="flex flex-col items-stretch border mt-0.5 mb-2.5 rounded-lg hover:bg-gray-900 duration-500">
                    <label className="font-bold">{dailyCost.costDate}</label>
                    <label>{parseFloat(dailyCost.amount).toFixed(2) + ' €'}</label>
                </div>
            );
    }

    return (
        <>
            <div id="cost_input_component" className="
                ml-0 my-1.5
                text-left
                lg:ml-60 lg:my-10
            ">
                <label className="font-bold m-1">Datum: </label>
                <Input
                    className="max-w-full mx-1 mt-1 mb-4 hover:bg-gray-400 duration-500 text-black"
                    type="date" value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                <label className="font-bold m-1"> Eurobetrag: </label>

                <div className="flex mx-1 mt-1 mb-4 text-black">
                    <Input
                        className="max-w-xs"
                        type="number" value={amount}
                        min="0.01"
                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                    />
                    <Button variant="outline" onClick={handleAddAmount} className="ml-1 hover:bg-gray-900 text-white">
                        +
                    </Button>
                </div>

                <div className="flex flex-col max-w-xs mx-1 mt-2 mb-2 h-56">
                    <label className="font-bold mb-1">
                        Beträge für {date ? date : 'n/a'} - ({totalAmount.toFixed(2)} €)
                    </label>
                    <DataTable columns={columns} data={currentAmounts.map((value, index) => {
                        let cost: Cost = {
                            id: index,
                            amount: value + ' €'
                        }
                        return cost
                    })}/>
                </div>

                <Button
                    className="hover:bg-gray-900 ml-1 mt-8 mb-2 w-32"
                    variant="outline" onClick={_ => {
                    sendDailyCost(date, totalAmount).then(_ => {
                        setDate('');
                        setTotalAmount(0);
                        setCurrentAmounts([]);
                        setRefresh(prevState => !prevState)
                    })
                }}
                >
                    Send
                </Button>
            </div>
            <div className="
                ml-0 mr-0 my-1 w-full
                lg:w-2/5 lg:my-10 lg:ml-10 lg:mr-80
            ">
                <ScrollArea className="h-96 rounded-md border text-center mx-10 my-5">
                    <div className="p-1">{getElementsToScroll()}</div>
                </ScrollArea>
            </div>
        </>
    );
}
