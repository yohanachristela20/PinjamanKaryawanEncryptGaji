import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const UpdateStatusChecker = () => {
    const [updateStatus, setUpdateStatus] = useState("");

    useEffect(() => {
        const checkUpdateStatus = async () => {
            try {
                const response = await axios.get("http://localhost:5000/status-update");
                setUpdateStatus(response.data.status);

                if (response.data.status === "updated") {
                    toast.success("Angsuran telah diperbarui secara otomatis hari ini!");
                } else {
                    toast.info("Belum ada pembaruan angsuran hari ini.");
                }
            } catch (error) {
                console.error("Gagal memeriksa status pembaruan:", error.message);
                toast.error("Terjadi kesalahan saat memeriksa status pembaruan.");
            }
        };

        checkUpdateStatus();

        const interval = setInterval(checkUpdateStatus, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h4>Status Pembaruan Angsuran</h4>
            <p>
                {updateStatus === "updated"
                    ? "Angsuran telah diperbarui secara otomatis hari ini."
                    : "Belum ada pembaruan angsuran hari ini."}
            </p>
        </div>
    );
};

export default UpdateStatusChecker;