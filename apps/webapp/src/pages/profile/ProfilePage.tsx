import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import { Button, Card, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsList, TabsTrigger } from '@roomi/ui'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuthStore, useUIStore, useFeedStore, type ActiveMode } from '@/lib/store'
import { cn } from '@roomi/ui'

const CITIES = ['Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Netanya', 'Herzliya', 'Ramat Gan']
const GENDERS = ['male', 'female', 'other']
const SLEEP_LABELS: Record<number, { emoji: string; key: string }> = {
  1: { emoji: '🌙', key: 'nightOwl' },
  2: { emoji: '🌙', key: 'lateSleeper' },
  3: { emoji: '🔄', key: 'flexible' },
  4: { emoji: '☀️', key: 'earlyRiser' },
  5: { emoji: '🌅', key: 'earlyBird' },
}

function LevelSelector({ value, onChange, options, color }: {
  value: number
  onChange: (val: number) => void
  options: { value: number; label: string }[]
  color: string
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            value === opt.value
              ? `${color} text-white`
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

const HOSTING_LABELS: Record<number, { emoji: string; key: string }> = {
  1: { emoji: '🏠', key: 'hostingNotAtAll' },
  2: { emoji: '🏠', key: 'hostingRarely' },
  3: { emoji: '🏠', key: 'hostingSometimes' },
  4: { emoji: '🏠', key: 'hostingOften' },
  5: { emoji: '🏠', key: 'hostingVeryMuch' },
}

const CLEANLINESS_LABELS: Record<number, { emoji: string; key: string }> = {
  1: { emoji: '🧹', key: 'cleanlinessRelaxed' },
  2: { emoji: '🧹', key: 'cleanlinessCasual' },
  3: { emoji: '🧹', key: 'cleanlinessModerate' },
  4: { emoji: '🧹', key: 'cleanlinessTidy' },
  5: { emoji: '🧹', key: 'cleanlinessVeryTidy' },
}

const NOISE_LABELS: Record<number, { emoji: string; key: string }> = {
  1: { emoji: '🔇', key: 'noiseVeryQuiet' },
  2: { emoji: '🔈', key: 'noiseQuiet' },
  3: { emoji: '🔉', key: 'noiseModerate' },
  4: { emoji: '🔊', key: 'noiseLively' },
  5: { emoji: '📢', key: 'noiseVeryLively' },
}

export function ProfilePage() {
  const { t, i18n } = useTranslation()
  const {
    isAuthenticated, user, logout, activeMode, setActiveMode,
    lifestyle, seekerPreferences,
    updateProfile, updateLifestyle, updateSeekerPreferences,
  } = useAuthStore()
  const { openLoginModal } = useUIStore()
  const { likedPropertyIds, passedPropertyIds, resetFeed } = useFeedStore()

  const [showModeModal, setShowModeModal] = useState(false)
  const [pendingMode, setPendingMode] = useState<ActiveMode | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [instagram, setInstagram] = useState('')
  const [isSmoker, setIsSmoker] = useState(false)
  const [hasPet, setHasPet] = useState(false)
  const [keepsKosher, setKeepsKosher] = useState(false)
  const [isStudent, setIsStudent] = useState(false)
  const [hostingLevel, setHostingLevel] = useState(3)
  const [sleepingLevel, setSleepingLevel] = useState(3)
  const [cleanlinessLevel, setCleanlinessLevel] = useState(3)
  const [noiseLevel, setNoiseLevel] = useState(3)
  const [budgetMin, setBudgetMin] = useState(2000)
  const [budgetMax, setBudgetMax] = useState(6000)
  const [preferredCity, setPreferredCity] = useState('Tel Aviv')
  const [mustHaveBalcony, setMustHaveBalcony] = useState(false)
  const [mustHaveElevator, setMustHaveElevator] = useState(false)
  const [mustHaveParking, setMustHaveParking] = useState(false)
  const [mustHaveAc, setMustHaveAc] = useState(false)
  const [mustHaveFurnished, setMustHaveFurnished] = useState(false)
  const [mustHavePetsAllowed, setMustHavePetsAllowed] = useState(false)
  const [mustHaveSafeRoom, setMustHaveSafeRoom] = useState(false)
  const [roommateSmokerOk, setRoommateSmokerOk] = useState(true)
  const [roommatePetOk, setRoommatePetOk] = useState(true)
  const [roommateKosherRequired, setRoommateKosherRequired] = useState(false)
  const [preferredGender, setPreferredGender] = useState('')
  const [preferredAgeMin, setPreferredAgeMin] = useState<number | undefined>(undefined)
  const [preferredAgeMax, setPreferredAgeMax] = useState<number | undefined>(undefined)

  const hostingOptions = [
    { value: 1, label: t('profile.hostingNotAtAll') },
    { value: 2, label: t('profile.hostingRarely') },
    { value: 3, label: t('profile.hostingSometimes') },
    { value: 4, label: t('profile.hostingOften') },
    { value: 5, label: t('profile.hostingVeryMuch') },
  ]

  const sleepOptions = [
    { value: 1, label: `🌙 ${t('profile.nightOwl')}` },
    { value: 2, label: `🌙 ${t('profile.lateSleeper')}` },
    { value: 3, label: `🔄 ${t('profile.flexible')}` },
    { value: 4, label: `☀️ ${t('profile.earlyRiser')}` },
    { value: 5, label: `🌅 ${t('profile.earlyBird')}` },
  ]

  const cleanlinessOptions = [
    { value: 1, label: t('profile.cleanlinessRelaxed') },
    { value: 2, label: t('profile.cleanlinessCasual') },
    { value: 3, label: t('profile.cleanlinessModerate') },
    { value: 4, label: t('profile.cleanlinessTidy') },
    { value: 5, label: t('profile.cleanlinessVeryTidy') },
  ]

  const noiseOptions = [
    { value: 1, label: t('profile.noiseVeryQuiet') },
    { value: 2, label: t('profile.noiseQuiet') },
    { value: 3, label: t('profile.noiseModerate') },
    { value: 4, label: t('profile.noiseLively') },
    { value: 5, label: t('profile.noiseVeryLively') },
  ]

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen">
        <Header title={t('nav.profile')} showAuth={false} />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] px-4 text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">👤</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {t('profile.loginToView')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t('profile.trackMatches')}
          </p>
          <Button onClick={() => openLoginModal()}>
            {t('common.login')}
          </Button>
        </div>
      </div>
    )
  }

  const enterEditMode = () => {
    setDisplayName(user.display_name || user.full_name || '')
    setBio(user.bio || '')
    setInstagram(user.instagram_handle || '')
    setIsSmoker(lifestyle?.is_smoker || false)
    setHasPet(lifestyle?.has_pet || false)
    setKeepsKosher(lifestyle?.keeps_kosher || false)
    setIsStudent(lifestyle?.is_student || false)
    setHostingLevel(lifestyle?.hosting_level || 3)
    setSleepingLevel(lifestyle?.sleeping_level || 3)
    setCleanlinessLevel(lifestyle?.cleanliness_level || 3)
    setNoiseLevel(lifestyle?.noise_level || 3)
    setBudgetMin(seekerPreferences?.budget_min || 2000)
    setBudgetMax(seekerPreferences?.budget_max || 6000)
    setPreferredCity(seekerPreferences?.preferred_city || 'Tel Aviv')
    setMustHaveBalcony(seekerPreferences?.must_have_balcony || false)
    setMustHaveElevator(seekerPreferences?.must_have_elevator || false)
    setMustHaveParking(seekerPreferences?.must_have_parking || false)
    setMustHaveAc(seekerPreferences?.must_have_ac || false)
    setMustHaveFurnished(seekerPreferences?.must_have_furnished || false)
    setMustHavePetsAllowed(seekerPreferences?.must_have_pets_allowed || false)
    setMustHaveSafeRoom(seekerPreferences?.must_have_safe_room || false)
    setRoommateSmokerOk(seekerPreferences?.roommate_smoker_ok ?? true)
    setRoommatePetOk(seekerPreferences?.roommate_pet_ok ?? true)
    setRoommateKosherRequired(seekerPreferences?.roommate_kosher_required || false)
    setPreferredGender(seekerPreferences?.preferred_gender || '')
    setPreferredAgeMin(seekerPreferences?.preferred_age_min)
    setPreferredAgeMax(seekerPreferences?.preferred_age_max)
    setIsEditing(true)
  }

  const handleSave = () => {
    updateProfile({
      display_name: displayName,
      bio,
      instagram_handle: instagram,
    })
    updateLifestyle({
      is_smoker: isSmoker,
      has_pet: hasPet,
      keeps_kosher: keepsKosher,
      is_student: isStudent,
      hosting_level: hostingLevel,
      sleeping_level: sleepingLevel,
      cleanliness_level: cleanlinessLevel,
      noise_level: noiseLevel,
    })
    if (user.is_seeker || activeMode === 'seeker') {
      updateSeekerPreferences({
        budget_min: budgetMin,
        budget_max: budgetMax,
        preferred_city: preferredCity,
        must_have_balcony: mustHaveBalcony,
        must_have_elevator: mustHaveElevator,
        must_have_parking: mustHaveParking,
        must_have_ac: mustHaveAc,
        must_have_furnished: mustHaveFurnished,
        must_have_pets_allowed: mustHavePetsAllowed,
        must_have_safe_room: mustHaveSafeRoom,
        roommate_smoker_ok: roommateSmokerOk,
        roommate_pet_ok: roommatePetOk,
        roommate_kosher_required: roommateKosherRequired,
        preferred_gender: preferredGender && preferredGender !== 'none' ? preferredGender : undefined,
        preferred_age_min: preferredAgeMin,
        preferred_age_max: preferredAgeMax,
      })
    }
    setIsEditing(false)
  }

  const handleModeChange = (mode: ActiveMode) => {
    if (mode !== activeMode) {
      setPendingMode(mode)
      setShowModeModal(true)
    }
  }

  const confirmModeChange = () => {
    if (pendingMode) {
      setActiveMode(pendingMode)
      setPendingMode(null)
    }
    setShowModeModal(false)
  }

  const cancelModeChange = () => {
    setPendingMode(null)
    setShowModeModal(false)
  }

  const mustHaves = [
    { key: 'must_have_balcony', label: t('property.balcony'), bg: 'bg-green-100 text-green-700' },
    { key: 'must_have_elevator', label: t('property.elevator'), bg: 'bg-blue-100 text-blue-700' },
    { key: 'must_have_parking', label: t('property.parking'), bg: 'bg-purple-100 text-purple-700' },
    { key: 'must_have_ac', label: t('property.ac'), bg: 'bg-cyan-100 text-cyan-700' },
    { key: 'must_have_furnished', label: t('property.furnished'), bg: 'bg-amber-100 text-amber-700' },
    { key: 'must_have_pets_allowed', label: t('property.petsAllowed'), bg: 'bg-pink-100 text-pink-700' },
    { key: 'must_have_safe_room', label: t('profile.safeRoom'), bg: 'bg-red-100 text-red-700' },
  ]
  const activeMusts = mustHaves.filter(m => seekerPreferences?.[m.key as keyof typeof seekerPreferences])

  const showSeekerPrefs = activeMode === 'seeker' || user.is_seeker

  return (
    <div className="min-h-screen pb-20">
      <Header
        title={isEditing ? t('profile.editProfile') : t('nav.profile')}
      />

      {isEditing ? (
        <div className="relative">
          <div className="h-40 bg-pink-50 dark:bg-pink-950/20 overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <ellipse cx="80" cy="120" rx="120" ry="80" className="fill-pink-200/20 dark:fill-pink-400/10" />
              <ellipse cx="350" cy="40" rx="100" ry="70" className="fill-pink-200/20 dark:fill-pink-400/10" />
              <ellipse cx="200" cy="150" rx="80" ry="60" className="fill-pink-300/15 dark:fill-pink-400/5" />
            </svg>
          </div>
          <div className="flex flex-col items-center -mt-14">
            <div className="relative">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random&size=112`}
                alt={user.display_name || user.full_name}
                className="w-28 h-28 rounded-full object-cover ring-4 ring-background"
              />
              <button className="absolute bottom-0 end-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="h-40 bg-pink-50 dark:bg-pink-950/20 overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <ellipse cx="80" cy="120" rx="120" ry="80" className="fill-pink-200/20 dark:fill-pink-400/10" />
              <ellipse cx="350" cy="40" rx="100" ry="70" className="fill-pink-200/20 dark:fill-pink-400/10" />
              <ellipse cx="200" cy="150" rx="80" ry="60" className="fill-pink-300/15 dark:fill-pink-400/5" />
            </svg>
          </div>
          <div className="flex flex-col items-center -mt-14">
            <div className="relative">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random&size=112`}
                alt={user.display_name || user.full_name}
                className="w-28 h-28 rounded-full object-cover ring-4 ring-background"
              />
              {user.is_verified && (
                <div className="absolute -bottom-1 -end-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold mt-3">{user.display_name || user.full_name}</h1>
            {user.bio ? (
              <p className="text-sm text-muted-foreground mt-1 text-center px-8 line-clamp-2">{user.bio}</p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1 italic">{t('profile.addBio')}</p>
            )}
            {user.instagram_handle ? (
              <p className="text-sm text-primary mt-1">@{user.instagram_handle}</p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1 italic">{t('profile.addInstagram')}</p>
            )}
            <Button variant="outline" size="sm" className="mt-3 rounded-full" onClick={enterEditMode}>
              {t('profile.editProfile')}
            </Button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-6">
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-pink-100 dark:bg-pink-950/30 rounded-full">
            <button
              onClick={() => handleModeChange('seeker')}
              className={cn(
                "relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                activeMode === 'seeker'
                  ? "bg-white dark:bg-white text-pink-600 shadow-md"
                  : "text-pink-400 hover:text-pink-500"
              )}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {t('profile.seeker')}
              </span>
            </button>
            <button
              onClick={() => handleModeChange('host')}
              className={cn(
                "relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                activeMode === 'host'
                  ? "bg-white dark:bg-white text-pink-600 shadow-md"
                  : "text-pink-400 hover:text-pink-500"
              )}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t('profile.host')}
              </span>
            </button>
          </div>
        </div>

        {isEditing && (
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t('profile.displayName')}</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={user.full_name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">{t('profile.aboutMe')}</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t('profile.bioPlaceholder')}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">{t('profile.instagram')}</Label>
              <Input
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@username"
              />
            </div>
          </Card>
        )}

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">{t('profile.lifestyle')}</h3>
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">{isSmoker ? t('profile.smoker') : t('profile.nonSmoker')}</span>
                  <Switch checked={isSmoker} onCheckedChange={setIsSmoker} />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">{hasPet ? t('profile.hasPet') : t('profile.noPet')}</span>
                  <Switch checked={hasPet} onCheckedChange={setHasPet} />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">{keepsKosher ? t('profile.kosher') : t('profile.notKosher')}</span>
                  <Switch checked={keepsKosher} onCheckedChange={setKeepsKosher} />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">{isStudent ? t('profile.student') : t('profile.notStudent')}</span>
                  <Switch checked={isStudent} onCheckedChange={setIsStudent} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('profile.hosting')}</span>
                  <LevelSelector value={hostingLevel} onChange={setHostingLevel} color="bg-primary" options={hostingOptions} />
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('profile.sleeping')}</span>
                  <LevelSelector value={sleepingLevel} onChange={setSleepingLevel} color="bg-blue-500" options={sleepOptions} />
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('profile.cleanliness')}</span>
                  <LevelSelector value={cleanlinessLevel} onChange={setCleanlinessLevel} color="bg-emerald-500" options={cleanlinessOptions} />
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('profile.noise')}</span>
                  <LevelSelector value={noiseLevel} onChange={setNoiseLevel} color="bg-amber-500" options={noiseOptions} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium',
                  lifestyle?.is_smoker ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                )}>
                  {lifestyle?.is_smoker ? `🚬 ${t('profile.smoker')}` : `🚭 ${t('profile.nonSmoker')}`}
                </span>
                {lifestyle?.has_pet && <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">🐾 {t('profile.hasPet')}</span>}
                {lifestyle?.keeps_kosher && <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">✡️ {t('profile.kosher')}</span>}
                {lifestyle?.is_student && <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">🎓 {t('profile.student')}</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{t('profile.hosting')}</span>
                    <span className="text-xs text-muted-foreground">{HOSTING_LABELS[lifestyle?.hosting_level || 3]?.emoji}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{t(`profile.${HOSTING_LABELS[lifestyle?.hosting_level || 3]?.key}`)}</span>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{t('profile.sleeping')}</span>
                    <span className="text-xs text-muted-foreground">{SLEEP_LABELS[lifestyle?.sleeping_level || 3]?.emoji}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{t(`profile.${SLEEP_LABELS[lifestyle?.sleeping_level || 3]?.key}`)}</span>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{t('profile.cleanliness')}</span>
                    <span className="text-xs text-muted-foreground">{CLEANLINESS_LABELS[lifestyle?.cleanliness_level || 3]?.emoji}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{t(`profile.${CLEANLINESS_LABELS[lifestyle?.cleanliness_level || 3]?.key}`)}</span>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{t('profile.noise')}</span>
                    <span className="text-xs text-muted-foreground">{NOISE_LABELS[lifestyle?.noise_level || 3]?.emoji}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{t(`profile.${NOISE_LABELS[lifestyle?.noise_level || 3]?.key}`)}</span>
                </div>
              </div>
            </>
          )}
        </Card>

        {showSeekerPrefs && (
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">{t('profile.preferences')}</h3>
            {isEditing ? (
              <>
                <div className="space-y-3">
                  <Label>{t('profile.budgetRange')}</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">{t('profile.minBudget')}</Label>
                      <Input
                        type="number"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(Number(e.target.value))}
                        min={0}
                      />
                    </div>
                    <span className="text-muted-foreground mt-5">-</span>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">{t('profile.maxBudget')}</Label>
                      <Input
                        type="number"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(Number(e.target.value))}
                        min={budgetMin}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('profile.preferredCity')}</Label>
                  <Select value={preferredCity} onValueChange={setPreferredCity}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('profile.selectCity')} />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>{t('profile.mustHaves')}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">{t('property.balcony')}</span>
                      <Switch checked={mustHaveBalcony} onCheckedChange={setMustHaveBalcony} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">{t('property.elevator')}</span>
                      <Switch checked={mustHaveElevator} onCheckedChange={setMustHaveElevator} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">{t('property.parking')}</span>
                      <Switch checked={mustHaveParking} onCheckedChange={setMustHaveParking} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">{t('property.ac')}</span>
                      <Switch checked={mustHaveAc} onCheckedChange={setMustHaveAc} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">{t('property.furnished')}</span>
                      <Switch checked={mustHaveFurnished} onCheckedChange={setMustHaveFurnished} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">{t('property.petsAllowed')}</span>
                      <Switch checked={mustHavePetsAllowed} onCheckedChange={setMustHavePetsAllowed} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">{t('profile.safeRoom')}</span>
                      <Switch checked={mustHaveSafeRoom} onCheckedChange={setMustHaveSafeRoom} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  ₪{seekerPreferences?.budget_min?.toLocaleString()}–{seekerPreferences?.budget_max?.toLocaleString()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  📍 {seekerPreferences?.preferred_city}
                </span>
                {activeMusts.map((m) => (
                  <span key={m.key} className={cn('px-3 py-1 rounded-full text-xs font-medium', m.bg)}>
                    {m.label}
                  </span>
                ))}
              </div>
            )}
          </Card>
        )}

        {showSeekerPrefs && (
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">{t('profile.roommate')}</h3>
            {isEditing ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">{t('profile.smokerOk')}</span>
                    <Switch checked={roommateSmokerOk} onCheckedChange={setRoommateSmokerOk} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">{t('profile.petOk')}</span>
                    <Switch checked={roommatePetOk} onCheckedChange={setRoommatePetOk} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">{t('profile.kosherRequired')}</span>
                    <Switch checked={roommateKosherRequired} onCheckedChange={setRoommateKosherRequired} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('profile.preferredGender')}</Label>
                  <Select value={preferredGender} onValueChange={setPreferredGender}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('profile.noPreference')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('profile.noPreference')}</SelectItem>
                      {GENDERS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {t(`profile.${g}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('profile.ageRange')}</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">{t('profile.minAge')}</Label>
                      <Input
                        type="number"
                        value={preferredAgeMin ?? ''}
                        onChange={(e) => setPreferredAgeMin(e.target.value ? Number(e.target.value) : undefined)}
                        min={18}
                        max={99}
                      />
                    </div>
                    <span className="text-muted-foreground mt-5">-</span>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">{t('profile.maxAge')}</Label>
                      <Input
                        type="number"
                        value={preferredAgeMax ?? ''}
                        onChange={(e) => setPreferredAgeMax(e.target.value ? Number(e.target.value) : undefined)}
                        min={preferredAgeMin ?? 18}
                        max={99}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {seekerPreferences?.roommate_smoker_ok && <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">{t('profile.smokerOk')}</span>}
                  {seekerPreferences?.roommate_pet_ok && <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{t('profile.petOk')}</span>}
                  {seekerPreferences?.roommate_kosher_required && <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{t('profile.kosherRequired')}</span>}
                </div>
                {seekerPreferences?.preferred_gender && seekerPreferences.preferred_gender !== 'none' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('profile.preferredGender')}</span>
                    <span className="text-sm font-medium">{t(`profile.${seekerPreferences.preferred_gender}`)}</span>
                  </div>
                )}
                {(seekerPreferences?.preferred_age_min || seekerPreferences?.preferred_age_max) && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('profile.ageRange')}</span>
                    <span className="text-sm font-medium">{seekerPreferences?.preferred_age_min}–{seekerPreferences?.preferred_age_max}</span>
                  </div>
                )}
              </>
            )}
          </Card>
        )}

        {isEditing && (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => setIsEditing(false)}>
              {t('profile.cancel')}
            </Button>
            <Button className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white" onClick={handleSave}>
              {t('profile.save')}
            </Button>
          </div>
        )}

        <Card className="p-4">
          <h3 className="font-medium mb-3">{t('profile.activity')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {likedPropertyIds.length}
              </p>
              <p className="text-sm text-muted-foreground">{t('profile.liked')}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{passedPropertyIds.length}</p>
              <p className="text-sm text-muted-foreground">{t('profile.passed')}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-medium">{t('profile.settings')}</h3>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('profile.language')}</span>
            <Tabs value={i18n.language} onValueChange={(v) => i18n.changeLanguage(v)}>
              <TabsList className="h-9">
                <TabsTrigger value="he" className="text-sm px-3">
                  עברית
                </TabsTrigger>
                <TabsTrigger value="en" className="text-sm px-3">
                  English
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('profile.resetFeed')}</span>
            <Button variant="outline" size="sm" onClick={resetFeed}>
              {t('profile.reset')}
            </Button>
          </div>
        </Card>

        <Button
          variant="outline"
          className="w-full"
          onClick={logout}
        >
          {t('common.logout')}
        </Button>
      </div>

      <AlertDialog open={showModeModal} onOpenChange={setShowModeModal}>
        <AlertDialogContent className="max-w-sm mx-auto rounded-3xl">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center">
              {pendingMode === 'host' ? (
                <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
            <AlertDialogTitle className="text-xl">
              {pendingMode === 'host'
                ? (t('profile.switchToHost') || 'Switch to Host Mode?')
                : (t('profile.switchToSeeker') || 'Switch to Seeker Mode?')
              }
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {pendingMode === 'host'
                ? (t('profile.switchToHostDesc') || 'You\'ll see seekers who liked your properties and manage your listings.')
                : (t('profile.switchToSeekerDesc') || 'You\'ll browse available properties and find your next home.')
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={confirmModeChange}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full h-12"
            >
              {pendingMode === 'host'
                ? (t('profile.yesSwitch') || 'Yes, switch to Host')
                : (t('profile.yesSwitch') || 'Yes, switch to Seeker')
              }
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={cancelModeChange}
              className="w-full rounded-full h-12 mt-0"
            >
              {t('common.cancel')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
