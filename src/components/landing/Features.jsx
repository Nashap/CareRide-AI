import {
  Brain,
  ShieldCheck,
  MapPin,
 Heart,
  Users,
  Bot,
} from "lucide-react";

function Features() {
  const features = [
    {
      icon: <Brain size={26} />,
      title: "AI helper matching",
      description:
        "Matches by skill, distance, ratings and availability in seconds.",
    },
    {
      icon: <ShieldCheck size={26} />,
      title: "Verified helpers",
      description:
        "Background-checked volunteers, caregivers and trained companions.",
    },
    {
      icon: <MapPin size={26} />,
      title: "Accessible routes",
      description:
        "Wheelchair-friendly paths, ramps and barrier-free entrances.",
    },
    {
      icon: <Heart size={26} />,
      title: "Special assistance",
      description:
        "Elderly care, visual/hearing support and post-surgery assistance.",
    },
    {
      icon: <Users size={26} />,
      title: "Companion support",
      description:
        "Trusted company for hospital visits, errands and appointments.",
    },
    {
      icon: <Bot size={26} />,
      title: "AI travel assistant",
      description:
        "Friendly AI guidance for accessibility, bookings and travel planning.",
    },
  ];

  return (
    <section
      id="features"
      className="py-24 bg-[#faf7ef]"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}

        <div className="text-center mb-16">

          <h2 className="text-5xl font-bold text-slate-900">

            Designed for trust,
            <br />
            built for everyone

          </h2>

          <p className="mt-5 text-gray-500 text-lg max-w-3xl mx-auto">

            Every ride is supported by verified helpers
            and thoughtful Artificial Intelligence,
            helping people travel safely, comfortably,
            and independently.

          </p>

        </div>

        {/* Cards */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {features.map((feature, index) => (

            <div
              key={index}
              className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300"
            >

              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mb-6">

                {feature.icon}

              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-4">

                {feature.title}

              </h3>

              <p className="text-gray-600 leading-7">

                {feature.description}

              </p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}

export default Features;