import Opening from "@/components/Opening";
import Experience from "@/components/Experience";
import WhyWeBuiltThis from "@/components/WhyWeBuiltThis";
import WhoBuiltIt from "@/components/WhoBuiltIt";
import Philosophy from "@/components/Philosophy";
import RealTransformations from "@/components/RealTransformations";
import WhoItsBuiltFor from "@/components/WhoItsBuiltFor";
import EmbeddingExperience from "@/components/EmbeddingExperience";
import Pricing from "@/components/Pricing";
import Close from "@/components/Close";

export default function Home() {
  return (
    <main>
      <Opening />
      <Experience />
      <WhyWeBuiltThis />
      <WhoBuiltIt />
      <Philosophy />
      <RealTransformations />
      <WhoItsBuiltFor />
      <EmbeddingExperience />
      <Pricing />
      <Close />
    </main>
  );
}
