import {
  Car,
  Accessibility,
  HeartHandshake,
  Hospital,
  ShoppingBag,
  Bot,
} from "lucide-react";

function Services() {
  const services = [
    {
      icon: <Car size={34} />,
      title: "Accessible Transport",
      description:
        "Comfortable transportation designed for elderly people and persons with disabilities.",
    },
    {
      icon: <Accessibility size={34} />,
      title: "Wheelchair Assistance",
      description:
        "Professional helpers assist with wheelchair support from pickup to destination.",
    },
    {
      icon: <HeartHandshake size={34} />,
      title: "Personal Companion",
      description:
        "Verified companions travel with you during hospital visits, shopping and appointments.",
    },
    {
      icon: <Hospital size={34} />,
      title: "Hospital Visits",
      description:
        "Safe transportation and assistance for treatments, medical appointments and checkups.",
    },
    {
      icon: <ShoppingBag size={34} />,
      title: "Shopping Assistance",
      description:
        "Travel comfortably to supermarkets, pharmacies and shopping malls with a helper.",
    },
    {
      icon: <Bot size={34} />,
      title: "AI Recommendation",
      description:
        "Our AI recommends the most suitable helper according to your needs and location.",
    },
  ];

  return (
    <section
      id="services"
      className="py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}

        <div className="text-center mb-16">

          <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full font-medium">
            Our Services
          </span>

          <h2 className="text-5xl font-bold mt-6 text-slate-900">
            Everything you need for
            <span className="text-teal-600"> safe travel</span>
          </h2>

          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            CareRide AI combines trusted helpers,
            intelligent recommendations and accessible
            transportation to make every journey safer
            and easier.
          </p>

        </div>

        {/* Service Cards */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {services.map((service, index) => (

            <div
              key={index}
              className="bg-gray-50 rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300"
            >

              <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mb-6">

                {service.icon}

              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-4">

                {service.title}

              </h3>

              <p className="text-gray-600 leading-7">

                {service.description}

              </p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}

export default Services;