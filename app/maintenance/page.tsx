"use client";

import { useState, useEffect } from "react";
import { MAINTENANCE_CONFIG } from "@/constants/maintenance";

const MaintenancePage = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    const config = MAINTENANCE_CONFIG;

    useEffect(() => {
        // Usar o tempo estimado da configuração (em dias)
        const estimatedDays = config.estimatedDays || 5;
        const endTime = new Date().getTime() + (estimatedDays * 24 * 60 * 60 * 1000);

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance > 0) {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                setTimeLeft({ days, hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [config.estimatedDays]);

    return (
        <div>
            <div>
                <h1>
                    Site em Manutenção
                </h1>

                <p>
                    {config.maintenanceMessage}
                </p>

                <div>
                    <p>
                        Pedimos desculpas pelo inconveniente. Nossa equipe está realizando
                        melhorias importantes no sistema para oferecer um serviço ainda melhor.
                    </p>

                    <div>
                        <span>Tempo estimado de conclusão:</span>
                    </div>

                    <div>
                        <div>
                            <div>{timeLeft.days.toString().padStart(2, '0')}</div>
                            <div>Dias</div>
                        </div>
                        <div>
                            <div>{timeLeft.hours.toString().padStart(2, '0')}</div>
                            <div>Horas</div>
                        </div>
                        <div>
                            <div>{timeLeft.minutes.toString().padStart(2, '0')}</div>
                            <div>Minutos</div>
                        </div>
                        <div>
                            <div>{timeLeft.seconds.toString().padStart(2, '0')}</div>
                            <div>Segundos</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaintenancePage; 
