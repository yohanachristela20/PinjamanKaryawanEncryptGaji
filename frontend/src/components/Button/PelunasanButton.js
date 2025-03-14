import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

const PelunasanButton = ({ angsuranData }) => {
  const [lastAngsuran, setLastAngsuran] = useState([]);

  useEffect(() => {
    if (Array.isArray(angsuranData) && angsuranData.length > 0) {
      // Group by `id_pinjaman` and find the last installment with `bulan_angsuran < 60`
      const latestAngsuranByPinjaman = {};

      angsuranData.forEach((angsuran) => {
        if (angsuran.bulan_angsuran < 60) {
          // Check if this is the last installment for this `id_pinjaman`
          if (
            !latestAngsuranByPinjaman[angsuran.id_pinjaman ||
            angsuran.id_angsuran > latestAngsuranByPinjaman[angsuran.id_pinjaman]?.id_angsuran]
          ) {
            latestAngsuranByPinjaman[angsuran.id_pinjaman] = angsuran;
          }
        }
      });

      // Set the last angsuran data that meets the criteria
      setLastAngsuran(Object.values(latestAngsuranByPinjaman));
    }
  }, [angsuranData]);

  // Ensure there's valid angsuran data available
  if (!lastAngsuran || lastAngsuran.length === 0) {
    return null; // Don't render anything if no valid data
  }

  return (
    <>
      {lastAngsuran.map((angsuran) => (
        <Button
          key={angsuran.id_angsuran}
          className="btn-fill pull-right warning"
          variant="warning"
          onClick={() => {
            setShowPelunasanModal(true);
            setSelectedAngsuran(angsuran);
          }}
        >
          Pelunasan
        </Button>
      ))}
    </>
  );
};

export default PelunasanButton;
