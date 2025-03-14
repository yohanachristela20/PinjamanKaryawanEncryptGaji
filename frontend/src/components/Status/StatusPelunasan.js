import React, { useEffect } from "react";
import { Badge } from "react-bootstrap";



const PinjamanRow = ({ pinjaman }) => {

  const token = localStorage.getItem("token");
  const updateStatusPelunasan = async (idPinjaman, statusPelunasan) => {
    try {
      const response = await fetch(`http://10.70.10.157:5000/pinjaman/${idPinjaman}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
        },
        
        body: JSON.stringify({ status_pelunasan: statusPelunasan }),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui status pelunasan");
      }

      // console.log("Status pelunasan berhasil diperbarui untuk pinjaman:", idPinjaman);
    } catch (error) {
      console.error("Kesalahan saat memperbarui status pelunasan:", error);
    }
  };

  useEffect(() => {
    const angsuran = pinjaman.AngsuranPinjaman?.[0];
    if (angsuran?.belum_dibayar == 0) {
      const statusPelunasan = angsuran.status === "Lunas" ? "Lunas" : "Lunas";
      updateStatusPelunasan(pinjaman.id_pinjaman, statusPelunasan);
    } else {
      updateStatusPelunasan(pinjaman.id_pinjaman, "Belum Lunas");
    }
  }, [pinjaman]); 


  const renderStatusBadge = () => {
    const angsuran = pinjaman.AngsuranPinjaman?.[0];
    if (angsuran?.belum_dibayar == 0) {
      return angsuran.status === "Lunas" ? (
        <Badge pill bg="success p-2">Lunas</Badge>
      ) : (
        <Badge pill bg="danger p-2">Belum Lunas</Badge>
      );
    }

    return <Badge pill bg="danger p-2">Belum Lunas</Badge>;
  };

  return (
    <td className="text-center">
      {renderStatusBadge()}
    </td>
  );
};

export default PinjamanRow;
