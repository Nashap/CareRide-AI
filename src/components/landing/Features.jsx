import {
  ShieldCheck,
  Brain,
  MapPinned,
  Phone,
  MessageCircle,
  Star,
} from "lucide-react";

function Features() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Verified helpers",
      desc: "Volunteers, caregivers and trained companions ready to assist.",
    },
    {
      icon: Brain,
      title: "AI-powered matching",
      desc: "Gemini matches you with the best helper for your needs.",
    },
    {
      icon: MapPinned,
      title: "Accessible routes",
      desc: "Wheelchair-friendly paths with ramps and elevators.",
    },
    {
      icon: Phone,
      title: "SOS & live tracking",
      desc: "One-tap emergency alerts and real-time ride updates.",
    },
    {
      icon: MessageCircle,
      title: "In-app chat",
      desc: "Coordinate with your helper directly inside the app.",
    },
    {
      icon: Star,
      title: "Ratings & reviews",
      desc: "Trust through community feedback and verified ratings.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-4xl font-bold mb-8 text-gray-900">
        What we offer
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <div
              key={index}
              className="
                bg-white
                border
                border-gray-200
                rounded-2xl
                p-6
                hover:shadow-md
                transition
              "
            >
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-5">
                <Icon
                  size={22}
                  className="text-teal-500"
                />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Features;