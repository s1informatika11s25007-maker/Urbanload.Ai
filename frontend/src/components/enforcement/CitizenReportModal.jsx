import React, { useState } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { useToast } from '../ui/ToastNotification.jsx';
import { createCitizenReport, compressImage } from '../../lib/api/reports.js';
import { getDetailedDeviceLocation } from '../../lib/location-helper.js';
import { MapLocationPickerModal } from '../location/MapLocationPickerModal.jsx';
import { ShieldAlert, X, AlertOctagon, UploadCloud, Navigation, Loader2, MapPin } from 'lucide-react';

export function CitizenReportModal({ isOpen, onClose }) {
  const { showToast } = useToast();
  const [violationType, setViolationType] = useState('parkir_bahu_jalan');
  const [customViolationType, setCustomViolationType] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [locationName, setLocationName] = useState('Pasar Tanah Abang, Jakarta Pusat');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Map Location Picker Modal State
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // "Lokasi Saya" Ultra-Fast & High-Accuracy GPS Handler
  const handleGetCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const loc = await getDetailedDeviceLocation();
      setLocationName(loc.formattedAddress);
      showToast({
        title: 'Lokasi Saya Ditemukan Presisi',
        message: loc.formattedAddress,
        type: 'success',
      });
    } catch (err) {
      showToast({
        title: 'Izin Lokasi Perlu Diaktifkan',
        message: err.message || 'Klik ikon gembok/izin di sebelah kiri URL browser untuk mengizinkan Akses Lokasi.',
        type: 'warning',
      });
    } finally {
      setLoadingLocation(false);
    }
  };

  if (!isOpen) return null;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedDataUrl = await compressImage(file);
      setPhotoPreview(compressedDataUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const finalViolationType = (violationType === 'lainnya' && customViolationType.trim())
      ? customViolationType.trim()
      : violationType;

    try {
      const res = await createCitizenReport({
        violationType: finalViolationType,
        vehiclePlate: vehiclePlate ? vehiclePlate.toUpperCase() : null,
        locationName: locationName || 'Bahu Jalan Perkotaan',
        description: description || null,
        photoUrl: photoPreview || null,
      });

      if (res && res.data) {
        showToast({
          title: 'Laporan Publik Berhasil Disimpan!',
          message: `Tiket ID: ${res.data.id ? res.data.id.slice(0, 8) : 'DISPATCH'}. Tim Petugas Dishub telah menerima laporan.`,
          type: 'success',
        });
        setVehiclePlate('');
        setDescription('');
        setPhotoPreview(null);
        onClose();
      }
    } catch (err) {
      console.error('Error submitting citizen report:', err);
      showToast({
        title: 'Gagal Menyimpan Laporan',
        message: err.message || 'Terjadi kesalahan saat menghubungkan ke database.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
                <option value="lainnya">Lainnya (Ketik / Tulis Sendiri)</option>
              </select>

              {violationType === 'lainnya' && (
                <input
                  type="text"
                  required
                  placeholder="Ketikkan kategori pelanggaran kustom Anda di sini..."
                  value={customViolationType}
                  onChange={(e) => setCustomViolationType(e.target.value)}
                  className="w-full mt-2 p-2.5 bg-slate-50 border border-red-300 rounded-xl font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-red-500 transition animate-in fade-in duration-200"
                />
              )}
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

              {/* Lokasi / Posisi GPS - Clean Input & Map Picker + Lokasi Saya */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700 block">Lokasi Kejadiaan / Zona *</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="text-[10px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-200 flex items-center gap-0.5 transition"
                    >
                      <MapPin className="h-3 w-3 text-indigo-600" />
                      <span>Pilih Peta</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={loadingLocation}
                      className="text-[10px] font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-lg border border-teal-200 flex items-center gap-0.5 transition"
                    >
                      {loadingLocation ? (
                        <Loader2 className="h-3 w-3 animate-spin text-teal-600" />
                      ) : (
                        <Navigation className="h-3 w-3 text-teal-600" />
                      )}
                      <span>Lokasi Saya</span>
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Ketik alamat manual atau pilih dari peta..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-red-500 transition"
                />
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

      {/* Map Location Picker Modal */}
      <MapLocationPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialLocationName={locationName}
        onSelectLocation={(selectedAddress) => {
          setLocationName(selectedAddress);
          showToast({ title: 'Lokasi Peta Dipilih', message: selectedAddress, type: 'success' });
        }}
      />
    </>
  );
}
