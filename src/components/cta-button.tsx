"use client";

interface CtaButtonProps {
  isVisible: boolean;
  url: string;
  onClick?: () => void;
}

export default function CtaButton({ isVisible, url, onClick }: CtaButtonProps) {
  return (
    <div
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 max-h-32"
          : "opacity-0 translate-y-4 max-h-0 overflow-hidden"
      }`}
    >
      <div className="mt-6 text-center">
        <a
          href={url}
          onClick={onClick}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-2xl bg-primary px-10 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          Quiero unirme a la comunidad
        </a>
        <p className="mt-2 text-sm text-muted">
          Accede ahora a la comunidad y transforma tu descanso
        </p>
      </div>
    </div>
  );
}
