import React, { useState, useEffect } from "react";
import { Check, Camera, Video, Cat, Send, Trash, Upload, X, ExternalLink, ArrowLeft } from "lucide-react";

export default function App() {
  // State untuk menyimpan task-task
  const [tasks, setTasks] = useState([
    { id: 1, name: "Bawaan Seserahan", completed: false, photos: [], requireVideo: false, isOptional: false },
    { id: 2, name: "Buku Nikah", completed: false, photos: [], requireVideo: false, isOptional: false },
    { id: 3, name: "Mas Kawin", completed: false, photos: [], requireVideo: false, isOptional: false },
    { id: 4, name: "Kado - Kado", completed: false, photos: [], requireVideo: false, isOptional: false },
    { id: 5, name: "Amplop Tamu", completed: false, photos: [], requireVideo: true, isOptional: false },
    { id: 6, name: "Sisa Makanan (catering)", completed: false, photos: [], requireVideo: false, isOptional: false },
    { id: 7, name: "Buku Tamu", completed: false, photos: [], requireVideo: false, isOptional: false },
    { id: 8, name: "Sisa Souvenir", completed: false, photos: [], requireVideo: false, isOptional: false },
    { id: 9, name: "Serah Terima Foto", completed: false, photos: [], requireVideo: false, isOptional: false },
    { id: 10, name: "Buket Bunga", completed: false, photos: [], requireVideo: false, isOptional: true },
  ]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("Dokumentasi pernikahan:");
  const [sending, setSending] = useState(false);

  // Load dari local storage saat komponen dimount
  useEffect(() => {
    const savedTasks = localStorage.getItem("weddingTasks");
    const savedNumber = localStorage.getItem("whatsappNumber");
    const savedMessage = localStorage.getItem("whatsappMessage");

    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);

        // Convert stored base64 strings back to Blob objects and create URLs
        const processedTasks = parsedTasks.map((task) => {
          const processedPhotos = task.photos.map((photo) => {
            // If it's already a processed object with URL, return as is
            if (photo.url && !photo.base64Data) return photo;

            // If it has base64Data, convert it back to a Blob and create URL
            if (photo.base64Data) {
              const binary = atob(photo.base64Data.split(",")[1]);
              const array = [];
              for (let i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
              }
              const blob = new Blob([new Uint8Array(array)], { type: photo.type || "image/jpeg" });
              return {
                ...photo,
                url: URL.createObjectURL(blob),
                blob: blob,
              };
            }

            return photo;
          });

          return {
            ...task,
            photos: processedPhotos,
          };
        });

        setTasks(processedTasks);
      } catch (error) {
        console.error("Error loading tasks from localStorage:", error);
        // Fallback to default tasks if there's an error
      }
    }

    if (savedNumber) setWhatsappNumber(savedNumber);
    if (savedMessage) setWhatsappMessage(savedMessage);
  }, []);

  // Simpan ke local storage setiap kali tasks berubah
  useEffect(() => {
    try {
      // Create a copy of tasks with base64 data for storage
      const tasksForStorage = tasks.map((task) => {
        const photosForStorage = task.photos.map((photo) => {
          // Skip if this photo already has base64Data
          if (photo.base64Data) return photo;

          // Create new object with all properties except blob
          const { blob, ...photoWithoutBlob } = photo;

          // Add base64Data if it doesn't exist
          if (!photo.base64Data && blob) {
            return {
              ...photoWithoutBlob,
              // We'll need to create base64Data but this is simulated here
              // In a real app you'd use fileToBase64(blob) again
            };
          }

          return photoWithoutBlob;
        });

        return {
          ...task,
          photos: photosForStorage,
        };
      });

      localStorage.setItem("weddingTasks", JSON.stringify(tasksForStorage));
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
    }
  }, [tasks]);

  // Save WhatsApp details
  useEffect(() => {
    localStorage.setItem("whatsappNumber", whatsappNumber);
    localStorage.setItem("whatsappMessage", whatsappMessage);
  }, [whatsappNumber, whatsappMessage]);

  // Pastikan ketika component unmount (atau browser refresh), kita tetap menyimpan state
  useEffect(() => {
    // Save current state before page unloads
    const handleBeforeUnload = () => {
      try {
        const tasksForStorage = tasks.map((task) => {
          const photosForStorage = task.photos.map((photo) => {
            const { blob, ...photoWithoutBlob } = photo;
            return photoWithoutBlob;
          });

          return {
            ...task,
            photos: photosForStorage,
          };
        });

        localStorage.setItem("weddingTasks", JSON.stringify(tasksForStorage));
        localStorage.setItem("whatsappNumber", whatsappNumber);
        localStorage.setItem("whatsappMessage", whatsappMessage);
      } catch (error) {
        console.error("Error saving state before unload:", error);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [tasks, whatsappNumber, whatsappMessage]);

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Menangani upload file
  const handleFileUpload = async (e, isVideo) => {
    if (!selectedTask) return;

    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Simulasi upload
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);

        setTimeout(async () => {
          try {
            // Process each file to get base64 representation for storage
            const processedFiles = await Promise.all(
              files.map(async (file) => {
                const base64Data = await fileToBase64(file);
                return {
                  url: URL.createObjectURL(file),
                  isVideo: isVideo,
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  base64Data: base64Data,
                  blob: file,
                };
              })
            );

            // Update task dengan file yang di-upload
            const updatedTasks = tasks.map((task) => {
              if (task.id === selectedTask.id) {
                return {
                  ...task,
                  photos: [...task.photos, ...processedFiles],
                  completed: true,
                };
              }
              return task;
            });

            setTasks(updatedTasks);
            setUploadProgress(0);
            setShowModal(false); // Auto close modal after upload
          } catch (error) {
            console.error("Error processing files:", error);
            setUploadProgress(0);
          }
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

  // Preview media
  const handlePreviewMedia = (media) => {
    setPreviewMedia(media);
    setPreviewVisible(true);
  };

  // Mengirim semua foto dan video ke WhatsApp
  const sendToWhatsApp = async () => {
    if (!whatsappNumber) {
      alert("Masukkan nomor WhatsApp tujuan terlebih dahulu");
      return;
    }

    // Cek apakah semua tugas yang tidak opsional sudah selesai
    const requiredTasks = tasks.filter((task) => !task.isOptional);
    const allRequiredTasksCompleted = requiredTasks.every((task) => task.completed);

    if (!allRequiredTasksCompleted) {
      alert("Mohon selesaikan semua tugas wajib terlebih dahulu");
      return;
    }

    setSending(true);

    try {
      // Format nomor WhatsApp (hapus + dan spasi)
      const formattedNumber = whatsappNumber.replace(/\D/g, "");

      // Susun pesan
      let message = encodeURIComponent(whatsappMessage + "\n\n");

      // Tambahkan daftar item yang sudah difoto
      tasks.forEach((task) => {
        if (task.completed) {
          message += encodeURIComponent(`✅ ${task.name}\n`);
        } else if (task.isOptional) {
          message += encodeURIComponent(`⚪ ${task.name} (Opsional)\n`);
        }
      });

      // Simulasi pengiriman - dalam aplikasi nyata, ini bisa menggunakan WhatsApp Business API
      setTimeout(() => {
        // Buat URL WhatsApp Web/API
        const whatsappUrl = `https://wa.me/${formattedNumber}?text=${message}`;

        // Buka WhatsApp di tab baru
        window.open(whatsappUrl, "_blank");

        // Tampilkan modal konfirmasi
        setSending(false);
        setShowCompletionModal(true);
      }, 1500);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      alert("Gagal mengirim pesan. Silakan coba lagi.");
      setSending(false);
    }
  };

  // Reset aplikasi
  const resetApp = () => {
    const confirmed = window.confirm("Anda yakin ingin menghapus semua data?");
    if (confirmed) {
      localStorage.removeItem("weddingTasks");
      setTasks([
        { id: 1, name: "Bawaan Seserahan", completed: false, photos: [], requireVideo: false, isOptional: false },
        { id: 2, name: "Buku Nikah", completed: false, photos: [], requireVideo: false, isOptional: false },
        { id: 3, name: "Mas Kawin", completed: false, photos: [], requireVideo: false, isOptional: false },
        { id: 4, name: "Kado - Kado", completed: false, photos: [], requireVideo: false, isOptional: false },
        { id: 5, name: "Amplop Tamu", completed: false, photos: [], requireVideo: true, isOptional: false },
        { id: 6, name: "Sisa Makanan (catering)", completed: false, photos: [], requireVideo: false, isOptional: false },
        { id: 7, name: "Buku Tamu", completed: false, photos: [], requireVideo: false, isOptional: false },
        { id: 8, name: "Sisa Souvenir", completed: false, photos: [], requireVideo: false, isOptional: false },
        { id: 9, name: "Serah Terima Foto", completed: false, photos: [], requireVideo: false, isOptional: false },
        { id: 10, name: "Buket Bunga", completed: false, photos: [], requireVideo: false, isOptional: true },
      ]);
      setWhatsappNumber("");
      setWhatsappMessage("Dokumentasi pernikahan:");
      setShowCompletionModal(false);
    }
  };

  // Check if task has a video
  const hasVideo = (task) => {
    return task.photos.some((photo) => photo.isVideo);
  };

  // Check if task has photos
  const hasPhotos = (task) => {
    return task.photos.some((photo) => !photo.isVideo);
  };

  // Menghitung progres keseluruhan (hanya menghitung tugas yang tidak opsional)
  const nonOptionalTasks = tasks.filter((task) => !task.isOptional);
  const completedNonOptionalTasks = nonOptionalTasks.filter((task) => task.completed);
  const progressPercentage = (completedNonOptionalTasks.length / nonOptionalTasks.length) * 100;

  // Cek apakah semua tugas yang tidak opsional sudah selesai
  const allRequiredTasksCompleted = nonOptionalTasks.every((task) => task.completed);

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

          {/* WhatsApp Config */}
          <div className="mt-4 border-t border-pink-100 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-pink-700 text-sm font-medium mb-1">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Contoh: 628123456789"
                  className="w-full px-3 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <p className="text-xs text-gray-500 mt-1">Format: awali dengan kode negara (62 untuk Indonesia)</p>
              </div>
              <div>
                <label className="block text-pink-700 text-sm font-medium mb-1">Pesan WhatsApp</label>
                <input
                  type="text"
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  placeholder="Pesan untuk dikirim"
                  className="w-full px-3 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
            </div>
          </div>

          {allRequiredTasksCompleted && (
            <div className="mt-4 text-center">
              <button onClick={sendToWhatsApp} disabled={sending} className={`bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition ${sending ? "opacity-70 cursor-not-allowed" : ""}`}>
                {sending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Kirim ke WhatsApp</span>
                  </>
                )}
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
                    <div>
                      <span className={`font-medium ${task.completed ? "text-pink-700" : "text-gray-700"}`}>{task.name}</span>
                      <div className="flex gap-2 mt-1">
                        {task.requireVideo && <span className="bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded-md">+Video</span>}
                        {task.isOptional && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-md">Opsional</span>}
                      </div>
                    </div>
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
                            <div className="w-16 h-16 bg-pink-100 rounded flex items-center justify-center cursor-pointer" onClick={() => handlePreviewMedia(media)}>
                              <Video size={20} className="text-pink-500" />
                            </div>
                          ) : (
                            <img src={media.url} alt={media.name} className="w-16 h-16 object-cover rounded cursor-pointer" onClick={() => handlePreviewMedia(media)} />
                          )}
                          <button onClick={() => removeMedia(task.id, index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Status indikator untuk task yang memerlukan video */}
                    {task.requireVideo && (
                      <div className="mt-2 flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-md ${hasPhotos(task) ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>{hasPhotos(task) ? "✓ Foto" : "○ Foto"}</span>
                        <span className={`text-xs px-2 py-1 rounded-md ${hasVideo(task) ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>{hasVideo(task) ? "✓ Video" : "○ Video"}</span>
                      </div>
                    )}
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

      {/* Media Preview Modal */}
      {previewVisible && previewMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full bg-white rounded-lg overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button onClick={() => setPreviewVisible(false)} className="flex items-center gap-1 text-pink-500 hover:text-pink-700">
                  <ArrowLeft size={18} />
                  <span>Kembali</span>
                </button>
                <h3 className="font-medium text-gray-700 ml-2">{previewMedia.name}</h3>
              </div>
              <button onClick={() => setPreviewVisible(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="p-2 flex items-center justify-center bg-gray-100 max-h-96">
              {previewMedia.isVideo ? <video src={previewMedia.url} controls className="max-w-full max-h-full object-contain" /> : <img src={previewMedia.url} alt={previewMedia.name} className="max-w-full max-h-full object-contain" />}
            </div>

            <div className="p-4 bg-gray-50 flex justify-end">
              <button onClick={() => setPreviewVisible(false)} className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md text-sm transition">
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
            <p className="text-gray-600 mb-6">Pesan dokumentasi pernikahan telah dibuka di WhatsApp</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowCompletionModal(false)} className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition">
                Tutup
              </button>
            </div>
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
