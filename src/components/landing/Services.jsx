import {
  Accessibility,
  HeartHandshake,
  ShieldPlus,
} from "lucide-react";

function Services() {
  const services = [
    {
      icon: Accessibility,
      title: "Mobility Support",
      items: [
        "Wheelchair assistance",
        "Walker support",
        "Crutches support",
        "Walking assistance",
      ],
    },
    {
      icon: HeartHandshake,
      title: "Companion Support",
      items: [
        "Travel companion",
        "Hospital visits",
        "Shopping assistance",
        "Government office help",
      ],
    },
    {
      icon: ShieldPlus,
      title: "Special Assistance",
      items: [
        "Blind guide support",
        "Visually impaired assistance",
        "Hearing impaired assistance",
        "Post-surgery support",
      ],
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-14">
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-gray-900">
          Services you can request
        </h2>

        <p className="text-gray-500 mt-2">
          Personalized support for elderly citizens, persons with
          disabilities and recovering patients.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
        {services.map((service, index) => {
          const Icon = service.icon;

          return (
            <div
              key={index}
              className="
                bg-white
                rounded-2xl
                border
                border-gray-200
                p-6
                shadow-sm
                hover:shadow-lg
                hover:-translate-y-1
                transition-all
                duration-300
              "
            >
              <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center mb-5">
                <Icon
                  size={28}
                  className="text-teal-600"
                />
              </div>

              <h3 className="text-xl font-semibold mb-4">
                {service.title}
              </h3>

              <ul className="space-y-3">
                {service.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-gray-600"
                  >
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Services;