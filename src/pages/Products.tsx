import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/site/SEO";
import { SectionReveal } from "@/components/site/SectionReveal";
import { ArrowRight, Zap, Package } from "lucide-react";
import dgProduct from "@/assets/products/parts/enclosure.jpg";
import containerImg from "@/assets/products/showcase/container.png";
import { EditableText } from "@/components/cms/EditableText";
import { useCMSState } from "@/components/cms/CMSEditorProvider";

interface ProductCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  link: string;
}

const categories: ProductCategory[] = [
  {
    id: "dg-sets",
    title: "DG SETS",
    description: "High-performance Diesel generator sets for industrial and commercial power.",
    image: dgProduct,
    icon: <Zap className="w-6 h-6" />,
    link: "/products/dg-sets",
  },
  {
    id: "non-standard",
    title: "NON STANDARD",
    description: "Customized containers and specialized enclosures tailored to unique requirements.",
    image: containerImg,
    icon: <Package className="w-6 h-6" />,
    link: "/products/non-standard",
  },
];

export default function Products() {
  const navigate = useNavigate();
  // We only need useCMSState to get the value for SEO title, as SEO is not an EditableText
  const { content } = useCMSState();

  return (
    <>
      <SEO
        title={`${content.productConfig.sectionTitle} | Aditya Genset`}
        description={content.productConfig.sectionSubtitle}
      />

      <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 md:py-16 flex items-center">
        <div className="container-x w-full">
          {/* Header */}
          <SectionReveal>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-block font-display text-xs uppercase tracking-[0.3em] text-accent mb-3">
                <EditableText section="productConfig" contentKey="pageLabel" />
              </div>
              <EditableText 
                section="productConfig" 
                contentKey="sectionTitle" 
                className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 block" 
                as="h1" 
              />
              <EditableText 
                section="productConfig" 
                contentKey="sectionSubtitle" 
                className="text-sm text-muted-foreground max-w-xl mx-auto block" 
                as="p" 
              />
            </div>
          </SectionReveal>

          {/* Product Categories Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {categories.map((category, index) => (
              <SectionReveal key={category.id} delay={index * 100}>
                <div
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100"
                  onClick={(e) => {
                    if (document.querySelector('.fixed.inset-0.z-\\[100\\]')) {
                      e.preventDefault();
                      return;
                    }
                    navigate(category.link);
                  }}
                >
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                    
                    {/* Icon Badge */}
                    <div className="absolute top-6 left-6 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 z-10">
                      <div className="text-accent">
                        {category.icon}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <EditableText 
                      section="productConfig" 
                      contentKey={`category${index + 1}Title`} 
                      className="font-display text-2xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors duration-300 block" 
                      as="h2" 
                    />
                    <EditableText 
                      section="productConfig" 
                      contentKey={`category${index + 1}Desc`} 
                      className="text-sm text-muted-foreground mb-4 leading-relaxed block" 
                      as="p" 
                    />
                    
                    {/* CTA Button */}
                    <button className="inline-flex items-center gap-2 text-sm font-semibold text-accent group-hover:gap-4 transition-all duration-300 pointer-events-auto relative z-20" onClick={(e) => {
                      if (document.querySelector('.fixed.inset-0.z-\\[100\\]')) {
                        // Prevent navigation if in edit mode
                        e.stopPropagation();
                      }
                    }}>
                      <EditableText section="productConfig" contentKey="ctaText" />
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 border-2 border-accent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 pointer-events-none" />
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
