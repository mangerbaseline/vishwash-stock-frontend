'use client';

import Image from "next/image";
import { User } from 'lucide-react';
import {
  FaFacebook,
  FaGoogle,
  FaInstagram,
  FaGithub,
  FaVimeo,
  FaTwitter,
} from "react-icons/fa";

const channels = [
  {
    name: "Google",
    icon: <FaGoogle className="text-red-500 w-5 h-5" />,
    visitors: "3.5K",
    revenues: "$4,220.00",
    sales: "3456",
    conversion: "2.59%",
  },
  {
    name: "X.com",
    icon: <FaTwitter className="text-black w-5 h-5 dark:text-white" />,
    visitors: "3.5K",
    revenues: "$4,220.00",
    sales: "3456",
    conversion: "2.59%",
  },
  {
    name: "Github",
    icon: <FaGithub className="text-gray-800 dark:text-gray-200 w-5 h-5" />,
    visitors: "3.5K",
    revenues: "$4,220.00",
    sales: "3456",
    conversion: "2.59%",
  },
  {
    name: "Vimeo",
    icon: <FaVimeo className="text-blue-500 w-5 h-5" />,
    visitors: "3.5K",
    revenues: "$4,220.00",
    sales: "3456",
    conversion: "2.59%",
  },
  {
    name: "Facebook",
    icon: <FaFacebook className="text-blue-600 w-5 h-5" />,
    visitors: "3.5K",
    revenues: "$4,220.00",
    sales: "3456",
    conversion: "2.59%",
  },
];

const chats = [
  {
    name: "Jacob Jones",
    message: "See you tomorrow...",
    time: "Dec 19, 2024",
    avatar: "/avatars/jacob.jpg",
    online: true,
    unread: 3,
  },
  {
    name: "Wilium Smith",
    message: "Thanks for the up...",
    time: "Dec 19, 2024",
    avatar: "/avatars/wilium.jpg",
    online: true,
    unread: 0,
  },
  {
    name: "Johurul Haque",
    message: "What's up?",
    time: "Dec 19, 2024",
    avatar: "/avatars/johurul.jpg",
    online: false,
    unread: 0,
  },
  {
    name: "M. Chowdhury",
    message: "Where are you no...",
    time: "Dec 19, 2024",
    avatar: "/avatars/chowdhury.jpg",
    online: false,
    unread: 2,
  },
  {
    name: "Akagami",
    message: "Hey, how are you?",
    time: "Dec 19, 2024",
    avatar: "/avatars/akagami.jpg",
    online: true,
    unread: 0,
  },
];

export default function TopChannelsAndChats() {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Top Channels */}
      <div className="flex-1 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Top Channels</h2>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg width="20" height="20" fill="none" stroke="currentColor">
              <circle cx="3" cy="10" r="2" />
              <circle cx="10" cy="10" r="2" />
              <circle cx="17" cy="10" r="2" />
            </svg>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 dark:text-gray-300 text-xs">
                <th className="text-left font-medium pb-2">SOURCE</th>
                <th className="text-left font-medium pb-2">VISITORS</th>
                <th className="text-left font-medium pb-2">REVENUES</th>
                <th className="text-left font-medium pb-2">SALES</th>
                <th className="text-left font-medium pb-2">CONVERSION</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((ch, i) => (
                <tr
                  key={ch.name}
                  className={`${
                    i === 2 ? "bg-gray-100 dark:bg-gray-700" : ""
                  } rounded transition-colors`}
                >
                  <td className="flex items-center gap-2 py-3 font-medium">
                    {ch.icon}
                    {ch.name}
                  </td>
                  <td>{ch.visitors}</td>
                  <td className="text-green-500 font-semibold">
                    {ch.revenues}
                  </td>
                  <td>{ch.sales}</td>
                  <td>{ch.conversion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chats */}
      <div className="w-full md:w-80 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow p-6">
        <h2 className="font-semibold text-lg mb-4">Chats</h2>
        <ul>
          {chats.map((chat) => (
            <li
              key={chat.name}
              className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                      chat.online ? "bg-green-400" : "bg-orange-400"
                    }`}
                  />
                </div>
                <div>
                  <div className="font-medium">{chat.name}</div>
                  <div className="flex gap-3 text-xs">
                    <div className="text-gray-500 dark:text-gray-400">
                      {chat.message}
                    </div>
                    <div className="text-gray-400">{chat.time}</div>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                {chat.unread > 0 && (
                  <span className="text-xs bg-indigo-500 text-white rounded-full px-2 mt-1">
                    {chat.unread}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
