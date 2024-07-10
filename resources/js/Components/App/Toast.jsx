import { useEventBus } from "@/EventBus";
import { useEffect, useState } from "react";
import {v4 as uuidv4} from "uuid";

export default function Toast() {
    const [toasts, setToasts] = useState([]);
    const { on } = useEventBus();

    useEffect(() => {
        on('toast.show', (message) => {
            const uuid = uuidv4();
            // console.log(uuid);

            setToasts((oldToasts) => [...oldToasts, {message, uuid}]);

            setTimeout(() => {
                setToasts((oldToasts) => oldToasts.filter((toast) => toast.uuid !== uuid));
            }, 5000);
        });
    }, [on]);

    // console.log(toasts);

    return (
        <div className="toast toast-top min-w-[280px] w-full xs:w-auto">
            {toasts.map((toast) => (
                <div key={toast.uuid} className="alert alert-success py-3 px-4 text-gray-100 rounded-md w-auto">
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    );
};