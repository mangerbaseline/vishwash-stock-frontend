'use client'

import { Provider } from 'react-redux'
import { ThemeProvider } from 'next-themes'
import { store } from '@/store/store'
import { NotificationProvider } from './contexts/NotificationContext'
import { SearchProvider } from './contexts/SearchContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
      >
        <NotificationProvider>
          <SearchProvider>
            {children}
          </SearchProvider>
        </NotificationProvider>
      </ThemeProvider>
    </Provider>
  )
}







// 'use client'

// import { Provider } from 'react-redux'
// import { ThemeProvider } from 'next-themes'
// import { store } from '@/store/store'

// export default function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <Provider store={store}>
//       <ThemeProvider
//         attribute="class"
//         defaultTheme="light"
//         enableSystem
//       >
//         {children}
//       </ThemeProvider>
//     </Provider>
//   )
// }
