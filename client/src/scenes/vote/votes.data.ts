import { reassignIDs } from "Utility/dataMockup";
import { IVote } from "Utility/types";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
// tomorrow.setSeconds(tomorrow.getSeconds() + 10);

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const twoHoursAgo = new Date();
twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

const inTwoHours = new Date();
inTwoHours.setHours(inTwoHours.getHours() + 2);

const votes: IVote[] = [
    // not voted yet
    {
        id: "",
        title: "Senatswahl",
        description:
            "Entscheidet über die Zusammensetzung des Senats. Informationen zu den Kandidaten sind in den Gängen ausgehängt.",
        end: tomorrow,
        icon: "how_to_vote",
        type: "consensus",
        items: ["Max Mustermann", "Ein Kadidat"],
    },
    {
        id: "",
        title: "Abstimmung Mikrofon",
        description:
            "Entscheidung über das Mikrofon, das während politischer Versammlungen verwendet wird",
        icon: "poll",
        end: inTwoHours,
        type: "radio",
        items: [
            "Mein Mikrofon",
            "Kartoffel von McDonnalds",
            "Überhaupt kein Mikrofon",
        ],
    },
    // already voted
    {
        id: "",
        title: "Irgendeine Abstimmung",
        description: "Es wird keine Beschreibung benötigt",
        icon: "poll",
        end: inTwoHours,
        type: "radio",
        items: ["1", "2"],
        vote: 0,
    },
    {
        id: "",
        title: "Parlamentswahl",
        description:
            "Entscheidet über die Zusammensetzung des Parlaments. Informationen zu den Parteien sind in den Gängen ausgehängt.",
        icon: "how_to_vote",
        end: yesterday,
        type: "consensus",
        items: ["KPD", "SLJ", "MEP"],
        vote: [4, 3, 5],
        result: [3.652, 4.563, 0.945],
        chartInfo: {
            consensus: {
                colors: ["#78196E", "#F3E24D", "#19C5E4"],
            },
            parliamentComposition: {
                colors: ["#78196E", "#F3E24D", "#19C5E4"],
                seats: [12, 15, 3],
            },
        },
    },
    {
        id: "",
        title: "Abstimmung Mikrofon",
        description:
            "Entscheidung über das Mikrofon, das während politischer Versammlungen verwendet wird",
        icon: "poll",
        end: twoHoursAgo,
        type: "radio",
        items: [
            "Mein Mikrofon",
            "Kartoffel von McDonnalds",
            "Überhaupt kein Mikrofon",
        ],
        vote: 1,
        result: [0.365, 0.512, 0.123],
    },
    {
        id: "",
        title: "Abstimmung Ohne Alles",
        description:
            "Es wurde weder eine Stimme abgegeben, noch ist ein Ergebnis verfügbar",
        icon: "poll",
        end: new Date(2021, 9, 5, 8, 4),
        type: "radio",
        items: [
            "Mein Mikrofon",
            "Kartoffel von McDonnalds",
            "Überhaupt kein Mikrofon",
        ],
    },
];
export default reassignIDs(votes);
