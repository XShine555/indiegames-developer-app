import { useEffect, useRef, useState } from "react";
import { Trash2, Upload, Loader, Plus } from "lucide-react";
import Divider from "@components/Divider";
import StatusBadge from "@components/StatusBadge";
import Card from "@components/Card";
import { apiClient } from "@services/ApiClient";
import { getApiErrorMessage } from "@/utils/apiErrors";
import type { DeveloperGame } from "@models/DeveloperGame";
import type { DeveloperArtwork } from "@models/DeveloperArtwork";
import type { DeveloperStorePicture } from "@models/DeveloperStorePicture";

// ─── Artwork Slot ─────────────────────────────────────────────────────────────

type ArtworkSlotProps = {
    label: string;
    item: DeveloperArtwork | null;
    onUpload: (file: File) => Promise<void>;
};

function ArtworkSlot({ label, item, onUpload }: ArtworkSlotProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);

    const isProcessing = item?.processingStatus === "processing";
    const canUpload = !isProcessing && !uploading;

    const handleFile = async (file: File) => {
        setUploading(true);
        try { await onUpload(file); }
        finally { setUploading(false); }
    };

    return (
        <Card>
            <div className="flex flex-col gap-1 h-full">
                <label className="text-badge-neutral-text">{label}</label>
                <div
                    className={`
                        group mt-1 relative flex-1 flex items-center justify-center
                        min-h-44 overflow-hidden rounded-lg border border-dashed transition-colors
                        ${dragging ? "border-primary-border-hover bg-primary-bg-hover" : "border-border-inside-card bg-input-inside-card"}
                        ${canUpload ? "cursor-pointer hover:border-primary-border-hover hover:bg-primary-bg-hover" : ""}
                    `}
                    onClick={() => canUpload && inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); if (canUpload) setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        const file = e.dataTransfer.files[0];
                        if (file && canUpload) handleFile(file);
                    }}
                >
                    {item ? (
                        <>
                            {!imageLoaded && <div className="absolute inset-0 skeleton-block" />}
                            <img
                                src={item.mediumPictureUrl}
                                alt={label}
                                onLoad={() => setImageLoaded(true)}
                                className={`h-full w-full object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                            />
                            {isProcessing ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader size={20} className="animate-spin text-white" />
                                        <span className="text-sm font-light text-white/80">Procesando...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    {uploading
                                        ? <Loader size={20} className="animate-spin text-white" />
                                        : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload size={20} strokeWidth={1.5} className="text-white" />
                                                <span className="text-sm font-light text-white/80">Reemplazar</span>
                                            </div>
                                        )
                                    }
                                </div>
                            )}
                        </>
                    ) : uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader size={20} className="animate-spin text-primary-icon" />
                            <span className="text-sm font-light text-badge-neutral-text">Subiendo...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 px-6 py-8 text-center">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary-border bg-primary-bg transition-colors group-hover:border-primary-border-hover group-hover:bg-primary-bg-hover">
                                <Upload className="h-4 w-4 text-primary-icon" strokeWidth={1.75} />
                            </div>
                            <span className="text-sm font-light text-badge-neutral-text opacity-90">Añadir imagen</span>
                        </div>
                    )}
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                            e.target.value = "";
                        }}
                    />
                </div>
            </div>
        </Card>
    );
}

// ─── Store Picture Card ───────────────────────────────────────────────────────

function StorePictureCard({ item, onDelete, canDelete }: {
    item: DeveloperStorePicture;
    onDelete: (id: string) => Promise<void>;
    canDelete: boolean;
}) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const isDeletable = canDelete && (item.processingStatus === "Completed" || item.processingStatus === "Failed");

    const handleDelete = async () => {
        setDeleting(true);
        try { await onDelete(item.id); }
        finally { setDeleting(false); }
    };

    return (
        <div className="group relative flex flex-col rounded-xl border border-border-default bg-card-bg overflow-hidden">
            <div className="relative h-44 w-full bg-secondary-bg overflow-hidden">
                {!imageLoaded && <div className="absolute inset-0 skeleton-block z-10" />}
                <img
                    src={item.mediumPictureUrl}
                    alt=""
                    onLoad={() => setImageLoaded(true)}
                    className={`h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                />
                {isDeletable && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-light text-error-text bg-error-bg border border-error-border cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                            {deleting
                                ? <Loader size={14} className="animate-spin" />
                                : <Trash2 size={14} strokeWidth={1.5} />
                            }
                            <span>{deleting ? "Eliminando..." : "Eliminar"}</span>
                        </button>
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between px-3 py-2 border-t border-border-image">
                <span className="text-xs font-light text-secondary-text truncate max-w-[60%]">
                    {item.id}
                </span>
                <StatusBadge status={item.processingStatus} className="px-2 py-0.5" />
            </div>
        </div>
    );
}

// ─── Add Store Picture ────────────────────────────────────────────────────────

function AddStorePictureButton({ onUpload }: { onUpload: (file: File) => Promise<void> }) {
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);

    const handleFile = async (file: File) => {
        setUploading(true);
        try { await onUpload(file); }
        finally { setUploading(false); }
    };

    return (
        <label
            className={`
                group flex flex-col items-center justify-center gap-2 h-44 rounded-xl
                border border-dashed transition-colors
                ${dragging ? "border-primary-border-hover bg-primary-bg-hover" : "border-border-inside-card bg-input-inside-card hover:border-primary-border-hover hover:bg-primary-bg-hover"}
                ${uploading ? "pointer-events-none opacity-60 cursor-default" : "cursor-pointer"}
            `}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
            }}
        >
            <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.currentTarget.value = "";
                }}
            />
            {uploading ? (
                <Loader size={20} className="animate-spin text-primary-icon" />
            ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary-border bg-primary-bg transition-colors group-hover:border-primary-border-hover group-hover:bg-primary-bg-hover">
                    <Plus className="h-4 w-4 text-primary-icon" strokeWidth={1.75} />
                </div>
            )}
            <span className="text-sm font-light text-badge-neutral-text opacity-90">
                {uploading ? "Subiendo..." : "Añadir imagen"}
            </span>
        </label>
    );
}

// ─── Artworks Tab ─────────────────────────────────────────────────────────────

const ARTWORK_SLOTS = [
    { key: "capsule", label: "Capsule" },
    { key: "header",  label: "Header"  },
    { key: "main",    label: "Main"    },
] as const;

type ArtworkKey = typeof ARTWORK_SLOTS[number]["key"];

type ArtworksTabProps = {
    game: DeveloperGame;
    onRefetch: () => void;
};

export default function ArtworksTab({ game, onRefetch }: ArtworksTabProps) {
    const artworksByKey: Record<ArtworkKey, DeveloperArtwork | null> = {
        capsule: game.artworks[0] ?? null,
        header: game.artworks[1] ?? null,
        main: game.artworks[2] ?? null,
    };

    const [storePictures, setStorePictures] = useState(game.storePictures);

    useEffect(() => {
        setStorePictures(game.storePictures);
    }, [game.storePictures]);

    const handleUploadArtwork = (key: ArtworkKey) => async (file: File) => {
        const artworkId = artworksByKey[key]?.id;
        if (!artworkId) {
            throw new Error("No se encontró el artworkId para este slot.");
        }

        const formData = new FormData();
        formData.append("Artwork", file);

        const response = await apiClient.patch(`/games/${game.id}/artwork/${artworkId}`, formData);
        if (!response.ok) {
            throw new Error(getApiErrorMessage(response.status, {}, "No se pudo subir el artwork."));
        }

        onRefetch();
    };

    const handleUploadStorePicture = async (file: File) => {
        const formData = new FormData();
        formData.append("StorePicture", file);

        const response = await apiClient.post(`/games/${game.id}/store-picture`, formData);
        if (!response.ok) throw new Error("No se pudo subir la imagen.");

        onRefetch();
    };

    const handleDeleteStorePicture = async (id: string) => {
        await apiClient.delete(`/games/developer/store-picture/${id}`);
        setStorePictures((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <div className="flex flex-col gap-8">

            {/* ── Artworks ── */}
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {ARTWORK_SLOTS.map(({ key, label }) => (
                        <ArtworkSlot
                            key={key}
                            label={label}
                            item={artworksByKey[key]}
                            onUpload={handleUploadArtwork(key)}
                        />
                    ))}
                </div>
            </div>

            {/* ── Store Pictures ── */}
            <div className="flex flex-col gap-4">
                <Divider title="Store Pictures" />
                <p className="text-sm font-light text-secondary-text">
                    Estas imágenes se mostrarán en la página de tu juego en la tienda. Puedes subir varias y eliminarlas cuando quieras, pero ten en cuenta que cada imagen pasará por un proceso de revisión automática que puede tardar unos minutos. Durante ese tiempo, la imagen aparecerá como "Procesando..." y no podrás eliminarla ni subir una nueva para reemplazarla. Si el procesamiento falla, podrás intentar subirla de nuevo o eliminarla.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {storePictures.map((pic) => (
                        <StorePictureCard
                            key={pic.id}
                            item={pic}
                            onDelete={handleDeleteStorePicture}
                            canDelete={storePictures.length > 1}
                        />
                    ))}
                    <AddStorePictureButton onUpload={handleUploadStorePicture} />
                </div>
            </div>

        </div>
    );
}
