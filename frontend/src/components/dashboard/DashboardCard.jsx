import {
  Car,
  CalendarCheck,
  CheckCircle,
  Users,
} from "lucide-react";

function DashboardCard() {
  const cards = [
    {
      title: "Total Rides",
      value: "0",
      subtitle: "No rides yet",
      icon: <Car size={28} />,
      color: "bg-teal-500",
    },
    {
      title: "Upcoming",
      value: "0",
      subtitle: "Scheduled rides",
      icon: <CalendarCheck size={28} />,
      color: "bg-blue-500",
    },
    {
      title: "Completed",
      value: "0",
      subtitle: "Finished rides",
      icon: <CheckCircle size={28} />,
      color: "bg-green-500",
    },
    {
      title: "Helpers",
      value: "25+",
      subtitle: "Available nearby",
      icon: <Users size={28} />,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition"
        >
          <div className="flex justify-between items-center">

            <div>
              <p className="text-gray-500 text-sm">
                {card.title}
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {card.value}
              </h2>

              <p className="text-gray-400 text-sm mt-1">
                {card.subtitle}
              </p>
            </div>

            <div
              className={`${card.color} w-14 h-14 rounded-xl flex items-center justify-center text-white`}
            >
              {card.icon}
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardCard;