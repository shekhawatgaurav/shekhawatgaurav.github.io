import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { ImagePlus, Trash2, RefreshCcw } from "lucide-react";

import { db } from "../../firebase/firebaseConfig";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { uploadBannerFile, deleteFile } from "../../firebase/storage";
import { formatDateTime } from "../../utils/formatDate";

const MAX_IMAGE_SIZE_MB = 3;

function Banners() {
  const [banners, setBanners] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    link: "",
    status: "active",
  });

  const [file, setFile] = useState(null);
  const [deleteData, setDeleteData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadBanners() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setBanners(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load banners.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBanners();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleFileChange(e) {
    setError("");

    const selectedFile = e.target.files?.[0] || null;

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      setFile(null);
      return;
    }

    const sizeMb = selectedFile.size / (1024 * 1024);

    if (sizeMb > MAX_IMAGE_SIZE_MB) {
      setError(`Banner image must be under ${MAX_IMAGE_SIZE_MB}MB.`);
      setFile(null);
      return;
    }

    setFile(selectedFile);
  }

  function isValidLink(value = "") {
    if (!value.trim()) return true;

    const link = value.trim();

    return (
      link.startsWith("/") ||
      link.startsWith("http://") ||
      link.startsWith("https://")
    );
  }

  async function handleCreate(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const title = formData.title.trim();
    const subtitle = formData.subtitle.trim();
    const link = formData.link.trim();

    if (!title) {
      setError("Banner title is required.");
      return;
    }

    if (!isValidLink(link)) {
      setError("Banner link must start with /, http://, or https://.");
      return;
    }

    try {
      setSaving(true);

      let imageData = {
        imageUrl: "",
        imagePath: "",
      };

      if (file) {
        const uploaded = await uploadBannerFile(file);

        imageData = {
          imageUrl: uploaded.downloadURL,
          imagePath: uploaded.path,
        };
      }

      await addDoc(collection(db, "banners"), {
        title,
        subtitle,
        link,
        status: formData.status || "active",
        ...imageData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setFormData({
        title: "",
        subtitle: "",
        link: "",
        status: "active",
      });

      setFile(null);
      setMessage("Banner created successfully.");

      await loadBanners();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to create banner.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(banner) {
    const nextStatus = banner.status === "active" ? "inactive" : "active";

    try {
      setProcessingId(banner.id);
      setMessage("");
      setError("");

      await updateDoc(doc(db, "banners", banner.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });

      setBanners((items) =>
        items.map((item) =>
          item.id === banner.id ? { ...item, status: nextStatus } : item
        )
      );

      setMessage(
        nextStatus === "active"
          ? "Banner enabled successfully."
          : "Banner disabled successfully."
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update banner status.");
    } finally {
      setProcessingId("");
    }
  }

  async function confirmDelete() {
    if (!deleteData?.id) return;

    try {
      setProcessingId(deleteData.id);
      setMessage("");
      setError("");

      await deleteDoc(doc(db, "banners", deleteData.id));

      if (deleteData.imagePath) {
        try {
          await deleteFile(deleteData.imagePath);
        } catch (storageError) {
          console.warn("Banner image delete failed:", storageError);
        }
      }

      setBanners((items) => items.filter((item) => item.id !== deleteData.id));
      setDeleteData(null);
      setMessage("Banner deleted successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to delete banner.");
    } finally {
      setProcessingId("");
    }
  }

  const columns = [
    {
      key: "title",
      label: "Banner",
      render: (row) => (
        <div className="banner-cell">
          {row.imageUrl ? (
            <img src={row.imageUrl} alt={row.title || "Banner"} />
          ) : (
            <div className="banner-placeholder">No Image</div>
          )}

          <div>
            <strong>{row.title || "Untitled Banner"}</strong>
            <p>{row.subtitle || "No subtitle"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "link",
      label: "Link",
      render: (row) => row.link || "N/A",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge type={row.status === "active" ? "success" : "muted"} dot>
          {row.status || "inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  if (loading) return <Loader text="Loading banners..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Banners</h2>
          <p>Create and manage app home banners and promotional graphics.</p>
        </div>

        <Button variant="secondary" onClick={loadBanners}>
          <RefreshCcw size={18} />
          Reload
        </Button>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-2">
        <div className="card form-card">
          <form className="form-grid" onSubmit={handleCreate}>
            <h3 style={{ margin: 0 }}>Create Banner</h3>

            <div className="form-row">
              <label>Title</label>
              <input
                name="title"
                placeholder="Daily Bonus"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>Subtitle</label>
              <input
                name="subtitle"
                placeholder="Scratch today and win coins"
                value={formData.subtitle}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>Link / Action</label>
              <input
                name="link"
                placeholder="/scratch or https://example.com"
                value={formData.link}
                onChange={handleChange}
              />
              <small>Use app route like /scratch or full website URL.</small>
            </div>

            <div className="form-row">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-row">
              <label>Banner Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <small>Recommended wide image. Max size {MAX_IMAGE_SIZE_MB}MB.</small>
            </div>

            <Button type="submit" disabled={saving} loading={saving}>
              <ImagePlus size={18} />
              Create Banner
            </Button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Banner Tips</h3>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Use wide banner images, keep text short, and avoid fake earning
            claims like “guaranteed cash”. Safer wording: “earn rewards”,
            “collect coins”, “redeem after review”.
          </p>
        </div>
      </div>

      <div className="card table-card" style={{ marginTop: 18 }}>
        <div className="table-header">
          <h3>All Banners</h3>
        </div>

        <Table
          columns={columns}
          data={banners}
          emptyText="No banners found."
          showIndex
          renderActions={(row) => (
            <div className="actions" style={{ marginTop: 0 }}>
              <Button
                variant="secondary"
                disabled={processingId === row.id}
                loading={processingId === row.id}
                onClick={() => toggleStatus(row)}
              >
                {row.status === "active" ? "Disable" : "Enable"}
              </Button>

              <Button
                variant="danger"
                disabled={processingId === row.id}
                onClick={() => setDeleteData(row)}
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          )}
        />
      </div>

      <ConfirmDialog
        isOpen={!!deleteData}
        title="Delete Banner?"
        message="This banner will be removed from admin panel and its uploaded image will also be deleted if available."
        confirmText="Delete"
        variant="danger"
        loading={!!processingId}
        onCancel={() => {
          if (!processingId) setDeleteData(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default Banners;