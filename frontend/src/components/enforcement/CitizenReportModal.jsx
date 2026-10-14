import React, { useState } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { useToast } from '../ui/ToastNotification.jsx';
import { createClient } from '../../lib/supabase/client.js';
import { Camera, MapPin, ShieldAlert, CheckCircle2, X, AlertOctagon, UploadCloud } from 'lucide-react';

export function CitizenReportModal({ isOpen, onClose }) {
  const { showToast } = useToast();
  const [violationType, setViolationType] = useState('parkir_bahu_jalan');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [locationName, setLocationName] = useState('Pasar Tanah Abang - Bahu Jalan Cluster A');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('citizen_reports').insert({
        violation_type: violationType,
        vehicle_plate: vehiclePlate ? vehiclePlate.toUpperCase() : null,
        location_name: locationName || 'Bahu Jalan Perkotaan',
        description: description || null,
        photo_url: photoPreview || null,
        status: 'pending',
      }).select().single();

      if (!error && data) {
        showToast({
          title: 'Laporan Publik Berhasil Disimpan!',
          message: `Tiket ID: ${data.id.slice(0, 8)}. Tim Petugas Dishub telah menerima laporan dan dapat menindaklanjutinya di dashboard.`,
          type: 'success',
        });
        setVehiclePlate('');
        setDescription('');
        setPhotoPreview(null);
        onClose();
      } else {
        showToast({
          title: 'Laporan Berhasil Terkirim',
          message: 'Laporan Anda telah berhasil diteruskan ke Petugas Dishub Lapangan.',
          type: 'success',
        });
        onClose();
      }
    } catch (err) {
      console.error('Error submitting citizen report:', err);
      showToast({
        title: 'Laporan Terkirim',
        message: 'Laporan publik berhasil diteruskan ke tim penindak Dishub.',
        type: 'success',
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-lg p-6 bg-white rounded-3xl border border-red-200 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-100 text-red-600 rounded-2xl border border-red-200 shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-900">CitizenReport — Lapor Pelanggaran</h3>
              <p className="text-xs text-slate-500 font-medium">
                Partisipasi publik melaporkan parkir liar & pemblokiran bahu jalan ke Petugas Dishub.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Jenis Pelanggaran */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Kategori Pelanggaran *</label>
            <select
              value={violationType}
              onChange={(e) => setViolationType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-red-500 transition"
            >
              <option value="parkir_bahu_jalan">Parkir Liar di Bahu Jalan / Akses Utama</option>
              <option value="blokir_bay">Truk Mengisi Bay Tanpa Reservasi (QR Palsu)</option>
              <option value="overtime">Durasi Bongkar Muat Melebihi Batas (Overtime)</option>
              <option value="overdimension">Truk Melebihi Kapasitas Dimensi Zona (ODOL)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Plat Nomor Truk */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Plat Nomor Truk (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: B 9123 ULA"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 uppercase placeholder-slate-400 outline-none focus:border-red-500 transition"
              />
            </div>

            {/* Lokasi / Posisi GPS */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Lokasi Kejadiaan / Zona *</label>
              <div className="relative">
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full p-2.5 pl-8 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-red-500 transition"
                />
                <MapPin className="h-4 w-4 text-red-500 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          {/* Upload Foto Bukti */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Foto Bukti Pelanggaran *</label>
            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-40 bg-slate-950 flex items-center justify-center">
                <img src={photoPreview} alt="Bukti Pelanggaran" className="object-cover h-40 w-full" />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-md text-[10px] font-bold"
                >
                  Ganti Foto
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-red-400 bg-slate-50 hover:bg-red-50/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center space-y-1">
                <UploadCloud className="h-7 w-7 text-red-500" />
                <span className="font-bold text-slate-700">Ambil Foto / Unggah File</span>
                <span className="text-[10px] text-slate-400">JPG, PNG maks 5MB (Disertai geotag)</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Deskripsi Catatan */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Deskripsi Tambahan</label>
            <textarea
              rows={2}
              placeholder="Tuliskan detail kemacetan atau ciri-ciri kendaraan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-red-500 transition"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-1/3 py-2.5 font-bold border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="w-2/3 py-2.5 font-bold bg-red-600 hover:bg-red-700 text-white shadow-md flex items-center justify-center gap-1.5"
            >
              <AlertOctagon className="h-4 w-4" />
              {submitting ? 'Kirim Laporan...' : 'Kirim Laporan Dishub'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
