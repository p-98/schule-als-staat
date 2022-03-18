import { reassignIDs, repeatArr } from "Utility/dataMockup";

export type TEmployee = {
    id: string;
    name: string;
    image: string;
    job: {
        // virtual currency per hour
        salary: number;
        // working hours as per job contract
        hours: number;
        currentlyWorking: boolean;
    };
};

export const employees: TEmployee[] = reassignIDs(
    repeatArr(
        [
            {
                id: "",
                name: "Max Mustermann",
                image: "/profile.jpg",
                job: {
                    salary: 12.324,
                    hours: 4,
                    currentlyWorking: true,
                },
            },
            {
                id: "",
                name: "Joe Kurz",
                image: "/profile.jpg",
                job: {
                    salary: 17.023,
                    hours: 5,
                    currentlyWorking: false,
                },
            },
        ],
        2
    )
);
