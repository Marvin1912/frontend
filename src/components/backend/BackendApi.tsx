import {format, subMonths} from "date-fns";
import {DailyCost} from "@/components/model/costs/DailyCosts";
import {SpecialCost, SpecialCostEntry} from "@/components/model/costs/SpecialCost";

const host: String = 'http://192.168.178.29:8081/wildfly_domain_web_app/api-web'

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sendDailyCost(date: string, totalAmount: number) {

    let body = JSON.stringify({
        costDate: date,
        value: totalAmount
    });

    try {
        const response = await fetch(`${host}/daily_costs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        });

        if (response.ok) {
            // NOOP
        } else {
            alert('Fehler beim Senden der Daten. ' + response.status + ' ' + response.statusText);
        }
    } catch (error) {
        alert('Ein Fehler ist aufgetreten: ' + error);
    }

    await sleep(100)
}

export async function getDailyCostsGe(date: Date) {

    const formattedDate = format(subMonths(date, 2), 'yyyy-MM-dd');

    try {
        const response = await fetch(`${host}/daily_costs/${formattedDate}/ge`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            let result: DailyCost[] = []
            let data = await response.json();
            for (let i in data) {
                result.push({
                    'costDate': data[i]['costDate'],
                    'amount': data[i]['value']
                })
            }
            return result;
        } else {
            alert('Fehler beim Senden der Daten. ' + response.status + ' ' + response.statusText);
            return []
        }
    } catch (error) {
        alert('Ein Fehler ist aufgetreten: ' + error);
        return []
    }
}

export async function getSpecialCost(date: Date) {

    const formattedDate = format(date, 'yyyy-MM-dd');

    try {
        const response = await fetch(`${host}/special_costs/${formattedDate}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            let result: SpecialCost[] = []
            let specialCosts = await response.json();
            for (let i in specialCosts) {
                let entries: SpecialCostEntry[] = []
                for (let j in specialCosts[i].entries) {
                    entries.push({
                        'amount': specialCosts[i].entries[j].value,
                        'description': specialCosts[i].entries[j].description
                    })
                }
                result.push({
                    'costDate': specialCosts[i]['costDate'],
                    'entries': entries
                })
            }
            return result;
        } else {
            alert('Fehler beim Senden der Daten. ' + response.status + ' ' + response.statusText);
            return []
        }
    } catch (error) {
        alert('Ein Fehler ist aufgetreten: ' + error);
        return []
    }
}
