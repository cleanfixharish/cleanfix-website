import { ChangeEvent, useMemo, useRef, useState } from "react";
import {
  Check,
  Clapperboard,
  Download,
  ImagePlus,
  Loader2,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminTranslation } from "@/lib/adminI18n";
import { cleanfixApi } from "@/lib/cleanfixApi";

type VideoPreset = {
  id: string;
  nameKey: string;
  descriptionKey: string;
  prompt: string;
  accent: string;
};

const presets: VideoPreset[] = [
  {
    id: "before-after",
    nameKey: "Before & after",
    descriptionKey: "A satisfying cleaning transformation",
    prompt:
      "A bright modern Israeli apartment in Harish transforms from dusty and cluttered to spotless and calm. Smooth cinematic camera movement, realistic natural daylight, premium home-service advertising, subtle teal and warm brass accents.",
    accent: "bg-[#DDE9E7] text-[#174E57]",
  },
  {
    id: "service",
    nameKey: "Service spotlight",
    descriptionKey: "Show a professional at work",
    prompt:
      "A careful uniformed home-service professional installs a wall shelf precisely in a bright family apartment. Clean tools, protected floor, confident workmanship, warm natural light, realistic commercial cinematography.",
    accent: "bg-[#EEE4D4] text-[#765D38]",
  },
  {
    id: "trust",
    nameKey: "Trust & care",
    descriptionKey: "A warm customer-confidence scene",
    prompt:
      "A friendly CleanFixHarish professional finishes a home repair and the homeowner smiles with relief. Respectful body language, tidy room, authentic Israeli home, soft cinematic daylight, trustworthy premium brand feeling.",
    accent: "bg-[#DFE8DA] text-[#405F43]",
  },
  {
    id: "offer",
    nameKey: "Seasonal offer",
    descriptionKey: "An attention-grabbing social ad",
    prompt:
      "An elegant fast-paced montage of a spotless kitchen, sparkling windows, a neatly mounted television, and a refreshed living room. Premium home-service commercial, energetic camera motion, realistic details, teal and brass visual accents.",
    accent: "bg-[#E7E2EF] text-[#5A4C70]",
  },
];

const qualityRules = [
  "Photorealistic people, homes, tools, hands and movement",
  "Safe professional work with clean, protected surfaces",
  "No written text, logos or watermarks inside the generated scene",
  "Natural Israeli-home lighting with restrained teal and brass accents",
  "One clear action and a stable camera path for a clean four-second shot",
];

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The reference image could not be read."));
    reader.readAsDataURL(file);
  });

function getErrorMessage(error: unknown, tr: (text: string) => string) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    if (response?.data?.detail) return response.data.detail;
  }
  return error instanceof Error ? error.message : tr("Video generation failed.");
}

export default function AiVideoStudio() {
  const tr = useAdminTranslation();
  const [selectedPreset, setSelectedPreset] = useState(presets[0]);
  const [prompt, setPrompt] = useState(presets[0].prompt);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    model: string;
    duration: number;
    revised_prompt?: string;
  } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const readiness = useMemo(
    () => [
      { label: tr("Creative direction"), ready: prompt.trim().length >= 24 },
      { label: tr("Brand quality rules"), ready: true },
      { label: tr("Reference image"), ready: Boolean(referenceFile), optional: true },
      { label: tr("One-generation cost guardrail"), ready: true },
    ],
    [prompt, referenceFile, tr],
  );

  const choosePreset = (preset: VideoPreset) => {
    setSelectedPreset(preset);
    setPrompt(preset.prompt);
    setResult(null);
  };

  const chooseReference = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(tr("Choose a JPG, PNG or WebP image."));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error(tr("The reference image must be smaller than 8 MB."));
      return;
    }
    if (referencePreview) URL.revokeObjectURL(referencePreview);
    setReferenceFile(file);
    setReferencePreview(URL.createObjectURL(file));
    setResult(null);
  };

  const removeReference = () => {
    if (referencePreview) URL.revokeObjectURL(referencePreview);
    setReferenceFile(null);
    setReferencePreview("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const generate = async () => {
    if (prompt.trim().length < 24) {
      toast.error(tr("Describe the scene in a little more detail first."));
      return;
    }
    setGenerating(true);
    setResult(null);
    try {
      const image = referenceFile ? await fileToDataUrl(referenceFile) : undefined;
      const productionPrompt = [
        prompt.trim(),
        "CleanFixHarish production requirements:",
        ...qualityRules.map((rule) => `- ${rule}.`),
      ].join("\n");
      const video = await cleanfixApi.generateVideo({
        prompt: productionPrompt,
        image,
      });
      setResult(video);
      toast.success(tr("Your AI video shot is ready."));
    } catch (error) {
      toast.error(getErrorMessage(error, tr));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-4 overflow-x-clip text-start sm:space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-[#CFC3B4] bg-[#102E38] text-white shadow-[0_20px_60px_rgba(16,46,56,.16)]">
        <div className="grid min-w-0 gap-5 bg-[radial-gradient(circle_at_85%_20%,rgba(184,144,91,.28),transparent_36%)] p-5 sm:gap-6 sm:p-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="min-w-0">
            <Badge className="border border-white/15 bg-white/10 text-[#F3E4C8] hover:bg-white/10">
              <Sparkles className="me-1.5 h-3.5 w-3.5" /> {tr("AI Video Studio")}
            </Badge>
            <h1 className="mt-4 max-w-3xl break-words text-2xl font-semibold tracking-tight sm:text-4xl">
              {tr("Create polished CleanFixHarish videos in a few simple choices.")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68 sm:text-base">
              {tr(
                "Choose the purpose, describe one clear scene, optionally add a reference image, and generate one quality-controlled shot at a time.",
              )}
            </p>
          </div>
          <div className="min-w-0 rounded-2xl border border-white/12 bg-black/10 px-4 py-3 text-sm xl:max-w-xs">
            <p className="font-medium text-[#F3E4C8]">{tr("Safe default")}</p>
            <p className="mt-1 text-white/62">{tr("4 seconds · 720p · one paid generation")}</p>
          </div>
        </div>
      </section>

      <div className="grid min-w-0 gap-4 sm:gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)]">
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <Card className="border-[#D8D0C6] bg-[#FBF8F3] shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex min-w-0 items-start gap-3 sm:items-center">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#174E57] text-sm font-semibold text-white">1</span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-[#173F46]">{tr("What is this video for?")}</h2>
                  <p className="text-sm text-[#786F65]">{tr("Start from a proven marketing direction.")}</p>
                </div>
              </div>
              <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => choosePreset(preset)}
                    className={`min-w-0 rounded-2xl border p-4 text-start transition ${selectedPreset.id === preset.id ? "border-[#B8905B] bg-[#FFF9ED] ring-2 ring-[#B8905B]/15" : "border-[#DDD3C7] bg-white hover:border-[#BFCFCB]"}`}
                  >
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${preset.accent}`}>{tr(preset.nameKey)}</span>
                    <p className="mt-2 text-sm text-[#625C54]">{tr(preset.descriptionKey)}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D8D0C6] bg-[#FBF8F3] shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex min-w-0 items-start gap-3 sm:items-center">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#174E57] text-sm font-semibold text-white">2</span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-[#173F46]">{tr("Describe the scene")}</h2>
                  <p className="text-sm text-[#786F65]">
                    {tr("Plain language is enough. The quality rules are added automatically.")}
                  </p>
                </div>
              </div>
              <Label htmlFor="video-prompt" className="sr-only">{tr("Video description")}</Label>
              <Textarea
                id="video-prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={6}
                maxLength={1800}
                dir="ltr"
                className="mt-5 resize-y border-[#D8D0C6] bg-white text-base leading-7 text-start"
                placeholder={tr(
                  "Example: A careful professional cleans a sunlit kitchen while the homeowner relaxes...",
                )}
              />
              <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-[#847C72]">
                <span>{tr("Keep it to one scene and one main action.")}</span>
                <span dir="ltr">{prompt.length}/1800</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D8D0C6] bg-[#FBF8F3] shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex min-w-0 items-start gap-3 sm:items-center">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#174E57] text-sm font-semibold text-white">3</span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-[#173F46]">
                    {tr("Add a reference image (optional)")}
                  </h2>
                  <p className="text-sm text-[#786F65]">{tr("Use a room, service photo, or desired opening frame.")}</p>
                </div>
              </div>
              <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={chooseReference} />
              {referencePreview ? (
                <div className="relative mt-5 overflow-hidden rounded-2xl border border-[#D8D0C6] bg-white">
                  <img src={referencePreview} alt={tr("Selected video reference")} className="h-56 w-full object-cover" />
                  <Button type="button" size="icon" variant="secondary" className="absolute end-3 top-3 rounded-full" onClick={removeReference} aria-label={tr("Remove reference image")}>
                    <X className="h-4 w-4" />
                  </Button>
                  <p className="truncate px-4 py-3 text-sm text-[#625C54]" dir="auto">{referenceFile?.name}</p>
                </div>
              ) : (
                <button type="button" onClick={() => fileInput.current?.click()} className="mt-5 flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#B9AEA0] bg-white px-5 text-center transition hover:border-[#B8905B] hover:bg-[#FFF9ED]">
                  <ImagePlus className="h-7 w-7 text-[#B8905B]" />
                  <span className="mt-3 font-medium text-[#173F46]">{tr("Choose an image")}</span>
                  <span className="mt-1 text-xs text-[#786F65]">{tr("JPG, PNG or WebP · maximum 8 MB")}</span>
                </button>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="min-w-0 space-y-4 sm:space-y-6 2xl:sticky 2xl:top-24 2xl:self-start">
          <Card className="border-[#C8B07C] bg-[#FFF9ED] shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-[#684F2B]">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="font-semibold">{tr("Ready to create")}</h2>
              </div>
              <div className="mt-4 space-y-3">
                {readiness.map((item) => (
                  <div key={item.label} className="flex min-w-0 items-center gap-3 text-sm">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full ${item.ready ? "bg-[#174E57] text-white" : "bg-[#E6DED2] text-[#8B8175]"}`}>
                      {item.ready ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                    </span>
                    <span className="min-w-0 flex-1 break-words text-[#514C45]">{item.label}</span>
                    {item.optional && <span className="shrink-0 text-xs text-[#8B8175]">{tr("Optional")}</span>}
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-[#DED0B3] bg-white/65 p-4 text-xs leading-5 text-[#6D604C]">
                {tr("One click creates one four-second 1280×720 AI shot. Nothing is published automatically.")}
              </div>
              <Button onClick={generate} disabled={generating || prompt.trim().length < 24} className="mt-5 h-12 w-full bg-[#174E57] text-base hover:bg-[#0E343B]">
                {generating ? <><Loader2 className="me-2 h-5 w-5 animate-spin" />{tr("Creating your shot…")}</> : <><WandSparkles className="me-2 h-5 w-5" />{tr("Create AI video")}</>}
              </Button>
              <Button type="button" variant="ghost" className="mt-2 w-full text-[#6D665E]" onClick={() => { choosePreset(presets[0]); removeReference(); }} disabled={generating}>
                <RotateCcw className="me-2 h-4 w-4" />{tr("Reset studio")}
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-[#D8D0C6] bg-[#102E38] text-white shadow-sm">
            <CardContent className="p-0">
              <div className="flex aspect-video items-center justify-center bg-[radial-gradient(circle_at_center,rgba(184,144,91,.24),transparent_55%)]">
                {result ? (
                  <video key={result.url} src={result.url} controls playsInline className="h-full w-full object-contain" />
                ) : generating ? (
                  <div className="text-center">
                    <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#D8C092]" />
                    <p className="mt-3 text-sm text-white/70">{tr("Generating motion and checking the result…")}</p>
                  </div>
                ) : (
                  <div className="text-center text-white/65">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/8"><Play className="ml-1 h-6 w-6" /></span>
                    <p className="mt-3 text-sm">{tr("Your result will appear here")}</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{tr("Latest AI shot")}</p>
                    <p className="mt-1 break-all text-xs text-white/55" dir="ltr">{result ? `${result.duration}s · ${result.model}` : tr("Not generated yet")}</p>
                  </div>
                  {result && (
                    <Button asChild size="sm" variant="secondary">
                      <a href={result.url} download target="_blank" rel="noreferrer"><Download className="me-2 h-4 w-4" />{tr("Download")}</a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-[#D8D0C6] bg-[#FBF8F3] p-4 text-xs leading-5 text-[#6D665E]">
            <div className="flex items-center gap-2 font-semibold text-[#173F46]"><Clapperboard className="h-4 w-4" />{tr("Next production layer")}</div>
            <p className="mt-2">
              {tr(
                "Long-form music syncing, multiple-shot timelines, captions and social resizing will run through the dedicated GPU worker without changing this simple workflow.",
              )}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
