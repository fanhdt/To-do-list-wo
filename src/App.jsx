import React, { useState, useEffect } from "react";
import { Check, Camera, Video, Cat, Send, Trash, Upload, X } from "lucide-react";

export default function App() {
  // State untuk menyimpan task-task
  const [tasks, setTasks] = useState([
    { id: 1, name: "Bawaan Seserahan", completed: false, photos: [], requireVideo: false },
    { id: 2, name: "Buku Nikah", completed: false, photos: [], requireVideo: false },
    { id: 3, name: "Mas Kawin", completed: false, photos: [], requireVideo: false },
    { id: 4, name: "Kado - Kado", completed: false, photos: [], requireVideo: false },
    { id: 5, name: "Amplop Tamu", completed: false, photos: [], requireVideo: true },
    { id: 6, name: "Sisa Makanan (catering)", completed: false, photos: [], requireVideo: false },
    { id: 7, name: "Buku Tamu", completed: false, photos: [], requireVideo: false },
    { id: 8, name: "Sisa Souvenir", completed: false, photos: [], requireVideo: false },
    { id: 9, name: "Serah Terima Foto", completed: false, photos: [], requireVideo: false },
    { id: 10, name: "Buket Uang", completed: false, photos: [], requireVideo: false },
  ]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Load dari local storage saat komponen dimount
  useEffect(() => {
    const savedTasks = localStorage.getItem("weddingTasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Simpan ke local storage setiap kali tasks berubah
  useEffect(() => {
    localStorage.setItem("weddingTasks", JSON.stringify(tasks));
  }, [tasks]);

  // Menangani upload file
  const handleFileUpload = (e, isVideo) => {
    if (!selectedTask) return;

    const files = Array.from(e.target.files);

    // Simulasi upload
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);

        setTimeout(() => {
          // Update task dengan file yang di-upload
          const updatedTasks = tasks.map((task) => {
            if (task.id === selectedTask.id) {
              // Konversi file menjadi URL objek
              const newMedia = files.map((file) => ({
                url: URL.createObjectURL(file),
                isVideo: isVideo,
                name: file.name,
              }));

              return {
                ...task,
                photos: [...task.photos, ...newMedia],
                completed: true,
              };
            }
            return task;
          });

          setTasks(updatedTasks);
          setUploadProgress(0);
        }, 500);
      }
    }, 200);
  };

  // Menghapus foto/video
  const removeMedia = (taskId, mediaIndex) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const updatedPhotos = task.photos.filter((_, index) => index !== mediaIndex);
        return {
          ...task,
          photos: updatedPhotos,
          completed: updatedPhotos.length > 0,
        };
      }
      return task;
    });

    setTasks(updatedTasks);
  };

  // Mengirim semua foto dan video ke WhatsApp
  const sendToWhatsApp = () => {
    // Simulasi pengiriman ke WhatsApp
    setShowCompletionModal(true);

    // Dalam implementasi nyata, di sini bisa diintegrasikan dengan API WhatsApp
    // atau membuat link WA dengan data terlampir
  };

  // Reset aplikasi
  const resetApp = () => {
    const confirmed = window.confirm("Anda yakin ingin menghapus semua data?");
    if (confirmed) {
      localStorage.removeItem("weddingTasks");
      setTasks([
        { id: 1, name: "Bawaan Seserahan", completed: false, photos: [], requireVideo: false },
        { id: 2, name: "Buku Nikah", completed: false, photos: [], requireVideo: false },
        { id: 3, name: "Mas Kawin", completed: false, photos: [], requireVideo: false },
        { id: 4, name: "Kado - Kado", completed: false, photos: [], requireVideo: false },
        { id: 5, name: "Amplop Tamu", completed: false, photos: [], requireVideo: true },
        { id: 6, name: "Sisa Makanan (catering)", completed: false, photos: [], requireVideo: false },
        { id: 7, name: "Buku Tamu", completed: false, photos: [], requireVideo: false },
        { id: 8, name: "Sisa Souvenir", completed: false, photos: [], requireVideo: false },
        { id: 9, name: "Serah Terima Foto", completed: false, photos: [], requireVideo: false },
        { id: 10, name: "Buket Uang", completed: false, photos: [], requireVideo: false },
      ]);
      setShowCompletionModal(false);
    }
  };

  // Menghitung progres keseluruhan
  const progressPercentage = (tasks.filter((task) => task.completed).length / tasks.length) * 100;
  const allTasksCompleted = tasks.every((task) => task.completed);

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="bg-pink-500 shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Cat className="text-white" size={28} />
            <h1 className="text-xl md:text-2xl font-bold text-white">Wedding Checklist</h1>
          </div>
          <button onClick={resetApp} className="bg-pink-600 text-white px-3 py-1 rounded-full text-sm hover:bg-pink-700 transition">
            Reset
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 pt-6">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-pink-700 font-medium">Progress:</span>
            <span className="text-pink-700 font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-pink-100 rounded-full h-4">
            <div className="bg-pink-500 rounded-full h-4 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          {allTasksCompleted && (
            <div className="mt-4 text-center">
              <button onClick={sendToWhatsApp} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition">
                <Send size={18} />
                Kirim ke WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="container mx-auto px-4 pb-20">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className={`border-b border-pink-100 p-4 hover:bg-pink-50 transition ${task.completed ? "bg-pink-50" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-pink-300"></div>
                    )}
                    <span className={`font-medium ${task.completed ? "text-pink-700" : "text-gray-700"}`}>{task.name}</span>
                    {task.requireVideo && <span className="bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-md">+Video</span>}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setShowModal(true);
                    }}
                    className="bg-pink-500 hover:bg-pink-600 text-white text-sm px-3 py-1 rounded-md flex items-center gap-1 transition"
                  >
                    <Camera size={14} />
                    <span>Upload</span>
                  </button>
                </div>

                {/* Tampilkan media yang sudah di-upload */}
                {task.photos.length > 0 && (
                  <div className="mt-3 pl-9">
                    <div className="flex flex-wrap gap-2">
                      {task.photos.map((media, index) => (
                        <div key={index} className="relative group">
                          {media.isVideo ? (
                            <div className="w-16 h-16 bg-pink-100 rounded flex items-center justify-center">
                              <Video size={20} className="text-pink-500" />
                            </div>
                          ) : (
                            <img src={media.url || "/api/placeholder/80/80"} alt={media.name} className="w-16 h-16 object-cover rounded" />
                          )}
                          <button onClick={() => removeMedia(task.id, index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal Upload */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="border-b border-pink-100 p-4">
              <h3 className="text-lg font-medium text-pink-700 flex items-center gap-2">
                <Cat size={20} />
                {selectedTask.name}
              </h3>
            </div>

            <div className="p-4">
              {uploadProgress > 0 ? (
                <div className="mb-4">
                  <div className="w-full bg-pink-100 rounded-full h-4 mb-2">
                    <div className="bg-pink-500 rounded-full h-4 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p className="text-center text-sm text-pink-600">Uploading... {uploadProgress}%</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-pink-600 mb-2">Upload Foto</label>
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-pink-300 bg-pink-50 rounded-lg p-6 cursor-pointer hover:bg-pink-100 transition">
                      <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleFileUpload(e, false)} />
                      <div className="flex flex-col items-center text-center">
                        <Camera className="text-pink-500 mb-2" size={32} />
                        <span className="text-sm text-pink-700 font-medium">Klik untuk upload foto</span>
                        <span className="text-xs text-pink-400">Bisa pilih lebih dari 1 foto</span>
                      </div>
                    </label>
                  </div>

                  {selectedTask.requireVideo && (
                    <div>
                      <label className="block text-pink-600 mb-2">Upload Video</label>
                      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-pink-300 bg-pink-50 rounded-lg p-6 cursor-pointer hover:bg-pink-100 transition">
                        <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, true)} />
                        <div className="flex flex-col items-center text-center">
                          <Video className="text-pink-500 mb-2" size={32} />
                          <span className="text-sm text-pink-700 font-medium">Klik untuk upload video</span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-4 py-3 flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTask(null);
                  setUploadProgress(0);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Pengiriman */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center">
            <div className="mb-4 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <Check size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Berhasil!</h3>
            <p className="text-gray-600 mb-6">Semua foto dan video telah berhasil dikirim ke WhatsApp</p>
            <button onClick={() => setShowCompletionModal(false)} className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-pink-500 p-4">
        <div className="container mx-auto text-center text-white text-sm">
          <div className="flex items-center justify-center gap-2">
            <Cat size={16} />
            <span>Wedding Organizer Checklist App © 2025</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
