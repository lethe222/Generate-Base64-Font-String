import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload,
  Copy,
  Check,
  X,
  FileType,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import FeedbackForm from "./components/FeedbackForm";

type FontFormat = "truetype" | "opentype" | "woff" | "woff2";

interface ConvertedFont {
  id: string;
  fileName: string;
  fontFamily: string;
  format: FontFormat;
  mimeType: string;
  fileSizeBytes: number;
  base64: string;
  dataUrl: string;
  expandedSection: "css" | "base64" | null;
}

const EXT_MAP: Record<string, { format: FontFormat; mime: string }> = {
  ttf: { format: "truetype", mime: "font/truetype" },
  otf: { format: "opentype", mime: "font/opentype" },
  woff: { format: "woff", mime: "font/woff" },
  woff2: { format: "woff2", mime: "font/woff2" },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getExt(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function buildCssSnippet(font: ConvertedFont): string {
  return `@font-face {
  font-family: '${font.fontFamily}';
  src: url('${font.dataUrl}') format('${font.format}');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
      style={{
        background: copied ? "rgba(124,90,246,0.12)" : "rgba(124,90,246,0.07)",
        color: copied ? "#7c5af6" : "#8b84aa",
        border:
          "1px solid " +
          (copied ? "rgba(124,90,246,0.25)" : "rgba(124,90,246,0.12)"),
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "已复制" : label}
    </button>
  );
}

function FontCard({
  font,
  onRemove,
  onToggleSection,
}: {
  font: ConvertedFont;
  onRemove: (id: string) => void;
  onToggleSection: (id: string, section: "css" | "base64") => void;
}) {
  const [previewLoaded, setPreviewLoaded] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `@font-face { font-family: 'preview-${font.id}'; src: url('${font.dataUrl}') format('${font.format}'); }`;
    document.head.appendChild(style);
    const t = setTimeout(() => setPreviewLoaded(true), 80);
    return () => {
      document.head.removeChild(style);
      clearTimeout(t);
    };
  }, [font.id, font.dataUrl, font.format]);

  const cssSnippet = buildCssSnippet(font);

  const formatColors: Record<
    FontFormat,
    { bg: string; text: string; border: string }
  > = {
    truetype: {
      bg: "rgba(99,179,237,0.12)",
      text: "#3182ce",
      border: "rgba(99,179,237,0.25)",
    },
    opentype: {
      bg: "rgba(154,117,234,0.12)",
      text: "#805ad5",
      border: "rgba(154,117,234,0.25)",
    },
    woff: {
      bg: "rgba(72,187,120,0.12)",
      text: "#2f855a",
      border: "rgba(72,187,120,0.25)",
    },
    woff2: {
      bg: "rgba(124,90,246,0.12)",
      text: "#7c5af6",
      border: "rgba(124,90,246,0.25)",
    },
  };
  const fc = formatColors[font.format];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#ffffff",
        boxShadow:
          "0 2px 16px rgba(124,90,246,0.08), 0 1px 3px rgba(0,0,0,0.04)",
        border: "1px solid rgba(124,90,246,0.1)",
      }}
    >
      {/* header */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: "rgba(124,90,246,0.08)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(124,90,246,0.08)" }}
        >
          <FileType size={16} style={{ color: "#7c5af6" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-sm font-semibold truncate"
              style={{ color: "#1a1730", fontFamily: "'DM Mono', monospace" }}
            >
              {font.fileName}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: fc.bg,
                color: fc.text,
                border: `1px solid ${fc.border}`,
              }}
            >
              {font.format}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs" style={{ color: "#8b84aa" }}>
              {formatBytes(font.fileSizeBytes)}
            </span>
            <span className="text-xs" style={{ color: "#8b84aa" }}>
              → {Math.ceil(font.base64.length / 1024)} KB Base64
            </span>
          </div>
        </div>
        <button
          onClick={() => onRemove(font.id)}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
          style={{ color: "#c4b8f8" }}
        >
          <X size={13} />
        </button>
      </div>

      {/* font preview */}
      {previewLoaded && (
        <div
          className="px-5 py-5 border-b"
          style={{ borderColor: "rgba(124,90,246,0.08)" }}
        >
          <p
            className="text-[10px] font-medium uppercase tracking-widest mb-3"
            style={{ color: "#c4b8f8" }}
          >
            字体预览
          </p>
          <p
            className="text-2xl leading-tight mb-1.5"
            style={{
              fontFamily: `'preview-${font.id}', sans-serif`,
              color: "#1a1730",
            }}
          >
            永字八法，横竖撇捺折钩点
          </p>
          <p
            className="text-lg leading-relaxed mb-2"
            style={{
              fontFamily: `'preview-${font.id}', sans-serif`,
              color: "#5b42c0",
            }}
          >
            The quick brown fox jumps over the lazy dog
          </p>
          <p
            className="text-sm"
            style={{
              fontFamily: `'preview-${font.id}', sans-serif`,
              color: "#8b84aa",
            }}
          >
            0123456789 &nbsp;！@#￥%……&amp;*（） &nbsp;AaBbCcDd
          </p>
        </div>
      )}

      {/* base64 block */}
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "rgba(124,90,246,0.08)" }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "#c4b8f8" }}
          >
            Base64 字符串
          </span>
          <div className="flex items-center gap-2">
            <CopyButton text={font.base64} label="复制 Base64" />
            <button
              onClick={() => onToggleSection(font.id, "base64")}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
              style={{ color: "#8b84aa" }}
            >
              {font.expandedSection === "base64" ? (
                <ChevronUp size={13} />
              ) : (
                <ChevronDown size={13} />
              )}
            </button>
          </div>
        </div>
        <div
          className="rounded-xl px-4 py-3 cursor-pointer transition-all duration-150"
          style={{
            background: "#f7f5ff",
            border: "1px solid rgba(124,90,246,0.1)",
          }}
          onClick={() => onToggleSection(font.id, "base64")}
        >
          <code
            className="text-xs break-all leading-relaxed"
            style={{
              fontFamily: "'DM Mono', monospace",
              color: "#8b84aa",
              wordBreak: "break-all",
            }}
          >
            {font.expandedSection === "base64"
              ? font.base64
              : font.base64.slice(0, 72) +
                (font.base64.length > 72 ? " …" : "")}
          </code>
        </div>
      </div>

      {/* CSS snippet */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-2.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "#c4b8f8" }}
          >
            @font-face CSS
          </span>
          <div className="flex items-center gap-2">
            <CopyButton text={cssSnippet} label="复制 CSS" />
            <button
              onClick={() => onToggleSection(font.id, "css")}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
              style={{ color: "#8b84aa" }}
            >
              {font.expandedSection === "css" ? (
                <ChevronUp size={13} />
              ) : (
                <ChevronDown size={13} />
              )}
            </button>
          </div>
        </div>
        <div
          className="rounded-xl px-4 py-3 cursor-pointer transition-all duration-150 overflow-x-auto"
          style={{
            background: "#f7f5ff",
            border: "1px solid rgba(124,90,246,0.1)",
          }}
          onClick={() => onToggleSection(font.id, "css")}
        >
          {font.expandedSection === "css" ? (
            <pre
              className="text-xs leading-relaxed"
              style={{ fontFamily: "'DM Mono', monospace", color: "#5b42c0" }}
            >
              {cssSnippet}
            </pre>
          ) : (
            <code
              className="text-xs"
              style={{ fontFamily: "'DM Mono', monospace", color: "#8b84aa" }}
            >
              {"@font-face { font-family: '"}
              <span style={{ color: "#7c5af6" }}>{font.fontFamily}</span>
              {"'; … }"}
            </code>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [fonts, setFonts] = useState<ConvertedFont[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((files: FileList | File[]) => {
    setError(null);
    const arr = Array.from(files);
    const valid = arr.filter((f) => getExt(f.name) in EXT_MAP);

    if (valid.length === 0) {
      setError("未找到支持的字体文件，请上传 TTF、OTF、WOFF 或 WOFF2 格式");
      return;
    }
    if (valid.length < arr.length) {
      setError(`${arr.length - valid.length} 个文件已跳过（格式不支持）`);
    }

    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(",")[1];
        const ext = getExt(file.name);
        const { format, mime } = EXT_MAP[ext];
        const fontFamily = file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]/g, " ");

        setFonts((prev) => [
          {
            id: crypto.randomUUID(),
            fileName: file.name,
            fontFamily,
            format,
            mimeType: mime,
            fileSizeBytes: file.size,
            base64,
            dataUrl,
            expandedSection: null,
          },
          ...prev,
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  };
  const removeFont = (id: string) =>
    setFonts((prev) => prev.filter((f) => f.id !== id));
  const toggleSection = (id: string, section: "css" | "base64") => {
    setFonts((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              expandedSection: f.expandedSection === section ? null : section,
            }
          : f,
      ),
    );
  };

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background:
          "linear-gradient(145deg, #ede9ff 0%, #f7f5ff 30%, #ffffff 60%, #f0edff 85%, #ebe5ff 100%)",
      }}
    >
      {/* ── floating buttons ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <button
          title="用户反馈"
          onClick={() => setShowFeedback(true)}
          className="flex items-center justify-center rounded-2xl shadow-lg hover:scale-110 transition-transform"
          style={{ width: 44, height: 44, background: "linear-gradient(135deg, #7c6ef2, #a78bfa)" }}
        >
          <MessageSquare size={20} color="white" />
        </button>
        <FeedbackForm isOpen={showFeedback} onClose={() => setShowFeedback(false)} />

        <a
          href="https://lethe222.github.io/Design-tool-collection-website/#"
          target="_blank"
          rel="noopener noreferrer"
          title="返回首页"
          className="flex items-center justify-center rounded-2xl shadow-lg hover:scale-110 transition-transform"
          style={{ width: 44, height: 44, background: "#3370FF" }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "#3370FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" />
              <rect
                x="8"
                y="1"
                width="5"
                height="5"
                rx="1.5"
                fill="white"
                fillOpacity="0.6"
              />
              <rect
                x="1"
                y="8"
                width="5"
                height="5"
                rx="1.5"
                fill="white"
                fillOpacity="0.6"
              />
              <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" />
            </svg>
          </div>
        </a>
      </div>
      {/* decorative blobs */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "-120px",
          right: "-80px",
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,90,246,0.12) 0%, rgba(124,90,246,0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          bottom: "-100px",
          left: "-60px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(160,120,255,0.1) 0%, rgba(160,120,255,0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* header */}

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* hero text */}
        <div className="text-center mb-10">
          <h1
            className="text-4xl font-bold mb-3 tracking-tight"
            style={{ color: "#1a1730", lineHeight: 1.15 }}
          >
            上传字体，即刻生成
            <br />
            <span style={{ color: "#7c5af6" }}>Base64 编码</span>
          </h1>
          <p
            className="text-sm leading-relaxed max-w-md mx-auto"
            style={{ color: "#8b84aa" }}
          >
            支持 TTF / OTF / WOFF / WOFF2 格式，转换后可直接内联至 CSS。
            <br />
            全程在浏览器完成，文件不会上传至任何服务器。
          </p>
        </div>

        {/* drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className="relative rounded-2xl cursor-pointer transition-all duration-200 mb-6 select-none"
          style={{
            border: dragging
              ? "2px dashed #7c5af6"
              : "2px dashed rgba(124,90,246,0.25)",
            background: dragging
              ? "rgba(124,90,246,0.06)"
              : "rgba(255,255,255,0.7)",
            padding: "48px 24px",
            boxShadow: dragging
              ? "0 0 0 4px rgba(124,90,246,0.1)"
              : "0 2px 20px rgba(124,90,246,0.06)",
            backdropFilter: "blur(8px)",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            multiple
            className="sr-only"
            onChange={handleChange}
          />
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200"
              style={{
                background: dragging
                  ? "linear-gradient(135deg, #9b7bf6, #7c5af6)"
                  : "rgba(124,90,246,0.1)",
              }}
            >
              <Upload
                size={22}
                style={{ color: dragging ? "#ffffff" : "#7c5af6" }}
              />
            </div>
            <div>
              <p
                className="text-base font-semibold mb-1"
                style={{ color: dragging ? "#7c5af6" : "#1a1730" }}
              >
                {dragging ? "松开即可开始转换" : "拖拽字体文件至此处"}
              </p>
              <p className="text-xs" style={{ color: "#8b84aa" }}>
                或点击选择文件 &nbsp;·&nbsp; TTF &nbsp;·&nbsp; OTF &nbsp;·&nbsp;
                WOFF &nbsp;·&nbsp; WOFF2
              </p>
            </div>
          </div>
        </div>

        {/* error */}
        {error && (
          <div
            className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.15)",
              color: "#dc2626",
            }}
          >
            <X size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {/* results */}
        {fonts.length > 0 && (
          <div className="flex flex-col gap-4">
            {fonts.map((font) => (
              <FontCard
                key={font.id}
                font={font}
                onRemove={removeFont}
                onToggleSection={toggleSection}
              />
            ))}
          </div>
        )}

        {/* empty state */}
        {fonts.length === 0 && !error && (
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.65)",
              border: "1px solid rgba(124,90,246,0.1)",
              backdropFilter: "blur(8px)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: "#c4b8f8" }}
            >
              使用步骤
            </p>
            <div className="flex flex-col gap-4">
              {[
                [
                  "01",
                  "上传字体文件",
                  "支持 TTF、OTF、WOFF、WOFF2 格式，可同时上传多个",
                ],
                [
                  "02",
                  "预览并复制",
                  "查看字体渲染效果，一键复制 Base64 字符串或完整 CSS",
                ],
                [
                  "03",
                  "粘贴内联",
                  "将 @font-face 代码粘贴至样式表，无需外部文件依赖",
                ],
              ].map(([num, title, desc]) => (
                <div key={num} className="flex items-start gap-4">
                  <span
                    className="text-xs font-bold pt-0.5 shrink-0 w-6 text-center"
                    style={{
                      background: "linear-gradient(135deg, #9b7bf6, #7c5af6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {num}
                  </span>
                  <div>
                    <p
                      className="text-sm font-medium mb-0.5"
                      style={{ color: "#1a1730" }}
                    >
                      {title}
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "#8b84aa" }}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* footer */}
      <footer className="relative z-10 pb-8 text-center">
        <p className="text-xs" style={{ color: "#c4b8f8" }}>
          全程本地处理 · 字体文件不会离开你的浏览器
        </p>
      </footer>
    </div>
  );
}
