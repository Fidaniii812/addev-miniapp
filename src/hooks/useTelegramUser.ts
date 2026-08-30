import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { getTelegramWebApp } from './telegram'

export function useTelegramUser() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function initUser() {
      const tg = getTelegramWebApp()
      const tgUser = tg?.initDataUnsafe?.user

      if (!tgUser) {
        setLoading(false)
        return
      }

      try {
        // 1. Kontrollojmë nëse përdoruesi ekziston në Supabase
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', tgUser.id.toString())
          .single()

        if (existingUser) {
          setUser(existingUser)
        } else {
          // 2. Nëse nuk ekziston, e regjistrojmë automatikisht për herë të parë
          const newUser = {
            telegram_id: tgUser.id.toString(),
            username: tgUser.username || tgUser.first_name || 'User',
            points: 0,
            energy: 100,
            created_at: new Date().toISOString()
          }

          const { data: insertedUser, error: insertError } = await supabase
            .from('users')
            .insert([newUser])
            .select()
            .single()

          if (!insertError && insertedUser) {
            setUser(insertedUser)
          }
        }
      } catch (err) {
        console.error('Gabim gjatë lidhjes me Supabase:', err)
      } finally {
        setLoading(false)
      }
    }

    initUser()
  }, [])

  return { user, loading }
}
