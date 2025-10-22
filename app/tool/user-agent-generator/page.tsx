"use client"

import { useCallback, useRef } from "react"

import { useState, useEffect, startTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Download } from "lucide-react"
import dynamic from "next/dynamic"
import type { GenerationHistory } from "@/lib/supabase" // Declared the variable here

import GeneratorControls from "@/components/GeneratorControls"

const CustomModal = dynamic(() => import("@/components/CustomModal"), {
  loading: () => null,
  ssr: false,
})

const ProgressModal = dynamic(() => import("@/components/ProgressModal"), {
  loading: () => null,
  ssr: false,
})

// Loading skeleton removed - using LoadingOverlay instead

let supabaseModulesCache = null
const loadSupabaseModules = async () => {
  if (supabaseModulesCache) return supabaseModulesCache

  try {
    const module = await import("@/lib/supabase")
    supabaseModulesCache = {
      DeviceModel: module.DeviceModel,
      IOSVersion: module.IOSVersion,
      AppVersion: module.AppVersion,
      Configuration: module.Configuration,
      GenerationHistory: module.GenerationHistory,
      BlacklistedUserAgent: module.BlacklistedUserAgent,
      AndroidDeviceModel: module.AndroidDeviceModel,
      AndroidBuildNumber: module.AndroidBuildNumber,
      AndroidAppVersion: module.AndroidAppVersion,
      InstagramDeviceModel: module.InstagramDeviceModel,
      InstagramVersion: module.InstagramVersion,
      ChromeVersion: module.ChromeVersion,
      ResolutionDpi: module.ResolutionDpi,
      PixelFacebookDeviceModel: module.PixelFacebookDeviceModel,
      PixelFacebookBuildNumber: module.PixelFacebookBuildNumber,
      PixelFacebookAppVersion: module.PixelFacebookAppVersion,
      PixelInstagramDeviceModel: module.InstagramDeviceModel,
      PixelInstagramVersion: module.InstagramVersion,
      PixelInstagramChromeVersion: module.ChromeVersion,
      PixelInstagramResolutionDpi: module.ResolutionDpi,
      SamsungInstagramDeviceModel: module.InstagramDeviceModel,
      SamsungInstagramVersion: module.InstagramVersion,
      SamsungInstagramChromeVersion: module.ChromeVersion,
      SamsungInstagramResolutionDpi: module.ResolutionDpi,
      SamsungFacebookDeviceModel: module.AndroidDeviceModel,
      SamsungFacebookBuildNumber: module.InstagramBuildNumber,
      UserAgentHistory: module.GenerationHistory,
      InstagramBuildNumber: module.InstagramBuildNumber,
      SamsungInstagramBuildNumber: module.InstagramBuildNumber,
      // </CHANGE>
    }
    return supabaseModulesCache
  } catch (error) {
    console.error("Error loading Supabase modules:", error)
    return null
  }
}

export default function UserAgentGenerator() {
  const [platform, setPlatform] = useState("")
  const [appType, setAppType] = useState("")
  // Changed default quantity to 1
  const [quantity, setQuantity] = useState(1)
  // Added type annotation for userAgents
  const [userAgents, setUserAgents] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  // Added type annotation for history
  const [history, setHistory] = useState<GenerationHistory[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<"generator">("generator")
  const [connectionError, setConnectionError] = useState(null)
  const [accessKey, setAccessKey] = useState(null) // Added accessKey state

  const [supabaseModules, setSupabaseModules] = useState(null)

  const [isDataLoaded, setIsDataLoaded] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)

  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {},
    showCancel: false,
    confirmText: "Confirm",
    cancelText: "Cancel",
    isLoading: false,
  })

  // Progress Modal state
  const [progressModal, setProgressModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    progress: 0,
    type: "info",
    showCancel: false,
  })

  const [dataState, setDataState] = useState({
    deviceModels: [],
    iosVersions: [],
    appVersions: [],
    configurations: {},
    blacklistedUAs: new Set(),
    androidDeviceModels: [],
    androidBuildNumbers: [],
    androidAppVersions: [],
    instagramDeviceModels: [],
    instagramVersions: [],
    chromeVersions: [],
    resolutionDpis: [],
  })

  const [allCopied, setAllCopied] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)

  const [pixelFacebookDeviceModels, setPixelFacebookDeviceModels] = useState([])
  const [pixelFacebookBuildNumbers, setPixelFacebookBuildNumbers] = useState([])
  const [pixelFacebookAppVersions, setPixelFacebookAppVersions] = useState([])
  const [pixelInstagramDeviceModels, setPixelInstagramDeviceModels] = useState([])
  const [pixelInstagramVersions, setPixelInstagramVersions] = useState([])
  const [pixelInstagramChromeVersions, setPixelInstagramChromeVersions] = useState([])
  const [pixelInstagramResolutionDpis, setPixelInstagramResolutionDpis] = useState([])

  // Added deviceType state for Samsung Facebook generation
  const [deviceType, setDeviceType] = useState("")

  const [selectedModel, setSelectedModel] = useState("random")
  const [cachedData, setCachedData] = useState({
    instagramBuildNumbers: null,
    facebookBuildNumbers: null,
    samsungDevices: null,
    pixelDevices: null,
    allDevices: null,
  })

  const [availableModels, setAvailableModels] = useState([])
  const [selectedModelInfo, setSelectedModelInfo] = useState(null)

  const {
    deviceModels,
    iosVersions,
    appVersions,
    configurations,
    blacklistedUAs,
    androidDeviceModels,
    androidBuildNumbers,
    androidAppVersions,
    instagramDeviceModels,
    instagramVersions,
    chromeVersions,
    resolutionDpis,
  } = dataState

  useEffect(() => {
    let mounted = true

    const initializeSupabase = async () => {
      try {
        const modules = await loadSupabaseModules()
        if (mounted) {
          setSupabaseModules(modules)
          setConnectionError(null)
        }
      } catch (error) {
        if (mounted) {
          setConnectionError(error.message)
          console.error("Failed to initialize Supabase:", error)
        }
      }
    }

    startTransition(() => {
      initializeSupabase()
    })

    return () => {
      mounted = false
    }
  }, [])

  const showModal = useCallback(
    (
      title,
      message,
      type = "info",
      onConfirm = () => {},
      showCancel = false,
      confirmText = "Confirm",
      cancelText = "Cancel",
      isLoading = false,
    ) => {
      setModal({
        isOpen: true,
        title,
        message,
        type,
        onConfirm,
        showCancel,
        confirmText,
        cancelText,
        isLoading,
      })
    },
    [],
  )

  const showProgressModal = useCallback((title, message, progress = 0, type = "info", showCancel = false) => {
    setProgressModal({
      isOpen: true,
      title,
      message,
      progress,
      type,
      showCancel,
    })
  }, [])

  const hideProgressModal = useCallback(() => {
    setProgressModal((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const handleCancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsGenerating(false)
      hideProgressModal()
      showModal("⚠️ Generation Cancelled", "User agent generation has been cancelled.", "warning")
    }
  }, [hideProgressModal, showModal])

  const loadData = useCallback(async () => {
    if (!supabaseModules || isDataLoaded) return

    try {
      setConnectionError(null)
      console.log("[v0] Starting data loading...")

      const {
        DeviceModel,
        IOSVersion,
        AppVersion,
        Configuration,
        BlacklistedUserAgent,
        AndroidDeviceModel,
        AndroidBuildNumber,
        AndroidAppVersion,
        InstagramDeviceModel,
        InstagramVersion,
        ChromeVersion,
        ResolutionDpi,
        PixelFacebookDeviceModel,
        PixelFacebookBuildNumber,
        PixelFacebookAppVersion,
        PixelInstagramDeviceModel,
        PixelInstagramVersion,
        PixelInstagramChromeVersion,
        PixelInstagramResolutionDpi,
      } = supabaseModules

      const loadBatch1 = Promise.all([
        DeviceModel?.list() || Promise.resolve([]),
        IOSVersion?.list() || Promise.resolve([]),
        AppVersion?.list() || Promise.resolve([]),
        Configuration?.list() || Promise.resolve([]),
      ])

      const loadBatch2 = Promise.all([
        BlacklistedUserAgent?.list() || Promise.resolve([]),
        AndroidDeviceModel?.list() || Promise.resolve([]),
        AndroidBuildNumber?.list() || Promise.resolve([]),
        AndroidAppVersion?.list() || Promise.resolve([]),
      ])

      const loadBatch3 = Promise.all([
        InstagramDeviceModel?.list() || Promise.resolve([]),
        InstagramVersion?.list() || Promise.resolve([]),
        ChromeVersion?.list() || Promise.resolve([]),
        ResolutionDpi?.list() || Promise.resolve([]),
      ])

      const loadBatch4 = Promise.all([
        PixelFacebookDeviceModel?.list() || Promise.resolve([]),
        PixelFacebookBuildNumber?.list() || Promise.resolve([]),
        PixelFacebookAppVersion?.list() || Promise.resolve([]),
        PixelInstagramDeviceModel?.list() || Promise.resolve([]),
        PixelInstagramVersion?.list() || Promise.resolve([]),
        PixelInstagramChromeVersion?.list() || Promise.resolve([]),
        PixelInstagramResolutionDpi?.list() || Promise.resolve([]),
      ])

      const [batch1, batch2, batch3, batch4] = await Promise.all([loadBatch1, loadBatch2, loadBatch3, loadBatch4])

      const [devices, ios, apps, configs] = batch1
      const [blacklisted, androidDevices, androidBuilds, androidApps] = batch2
      const [instaDevices, instaVersions, chromeVersions, resolutionDpis] = batch3
      const [
        pixelFbDevices,
        pixelFbBuilds,
        pixelFbApps,
        pixelInstaDevices,
        pixelInstaVersions,
        pixelInstaChromes,
        pixelInstaResolutions,
      ] = batch4

      console.log("[v0] Pixel Facebook devices loaded:", pixelFbDevices?.length || 0)
      console.log("[v0] Pixel Facebook builds loaded:", pixelFbBuilds?.length || 0)
      console.log("[v0] Pixel Facebook apps loaded:", pixelFbApps?.length || 0)
      console.log("[v0] Pixel Instagram devices loaded:", pixelInstaDevices?.length || 0)
      console.log("[v0] Pixel Instagram versions loaded:", pixelInstaVersions?.length || 0)
      console.log("[v0] Pixel Instagram chrome versions loaded:", pixelInstaChromes?.length || 0)
      console.log("[v0] Pixel Instagram resolutions loaded:", pixelInstaResolutions?.length || 0)
      console.log("[v0] Samsung Instagram devices loaded:", instaDevices?.length || 0)
      console.log("[v0] Samsung Instagram versions loaded:", instaVersions?.length || 0)
      console.log("[v0] Samsung Chrome versions loaded:", chromeVersions?.length || 0)
      console.log("[v0] Samsung Resolution DPIs loaded:", resolutionDpis?.length || 0)

      startTransition(() => {
        const configsObj = {}
        configs.forEach((config) => {
          try {
            configsObj[config.config_key] = JSON.parse(config.config_value)
          } catch (e) {
            configsObj[config.config_key] = config.config_value
          }
        })

        const blacklistSet = new Set(blacklisted.map((b) => b.user_agent))

        setDataState({
          deviceModels: devices.filter((d) => d.is_active),
          iosVersions: ios.filter((v) => v.is_active),
          appVersions: apps.filter((a) => a.is_active),
          androidDeviceModels: androidDevices.filter((d) => d.is_active),
          androidBuildNumbers: androidBuilds.filter((b) => b.is_active),
          androidAppVersions: androidApps.filter((a) => a.is_active),
          instagramDeviceModels: instaDevices.filter((d) => d.is_active),
          instagramVersions: instaVersions.filter((v) => v.is_active),
          chromeVersions: chromeVersions.filter((v) => v.is_active),
          resolutionDpis: resolutionDpis.filter((r) => r.is_active),
          configurations: configsObj,
          blacklistedUAs: blacklistSet,
        })
      })

      console.log("[v0] Setting Pixel Facebook device models:", pixelFbDevices?.length || 0)
      console.log("[v0] Setting Pixel Instagram device models:", pixelInstaDevices?.length || 0)

      setPixelFacebookDeviceModels(pixelFbDevices || [])
      setPixelFacebookBuildNumbers(pixelFbBuilds || [])
      setPixelFacebookAppVersions(pixelFbApps || [])
      setPixelInstagramDeviceModels(pixelInstaDevices || [])
      setPixelInstagramVersions(pixelInstaVersions || [])
      setPixelInstagramChromeVersions(pixelInstaChromes || [])
      setPixelInstagramResolutionDpis(pixelInstaResolutions || [])

      const allDevices = [...(instaDevices || []), ...(androidDevices || []), ...(pixelInstaDevices || [])]
      const uniqueModels = Array.from(
        new Map(
          allDevices.map((device) => [
            device.model || device.model_name,
            {
              model: device.model || device.model_name,
              chipset: device.chipset || "N/A",
              code: device.code || device.device_codename || "N/A",
              android_version: device.android_version?.toString() || "N/A",
              resolutions: Array.isArray(device.resolutions)
                ? device.resolutions.join(", ")
                : device.resolutions || "N/A",
            },
          ]),
        ).values(),
      ).sort((a, b) => a.model.localeCompare(b.model))

      setAvailableModels(uniqueModels)

      console.log("[v0] Data loading completed successfully")
      setIsDataLoaded(true)
    } catch (error) {
      console.error("Error loading data:", error)
      setConnectionError("Failed to load data. Please check your connection and try again.")
    }
  }, [supabaseModules, isDataLoaded])

  const loadHistory = useCallback(async () => {
    if (!supabaseModules || !isDataLoaded) return

    try {
      const { UserAgentHistory } = supabaseModules
      if (!UserAgentHistory) {
        console.error("UserAgentHistory module not available")
        return
      }
      const history = await UserAgentHistory.list()
      setHistory(history.slice(0, 50))
    } catch (error) {
      console.error("Error loading history:", error)
    }
  }, [supabaseModules, isDataLoaded])

  useEffect(() => {
    if (supabaseModules && !isDataLoaded) {
      loadData()
    }
  }, [supabaseModules, isDataLoaded])

  useEffect(() => {
    if (supabaseModules && isDataLoaded) {
      loadHistory()
    }
  }, [supabaseModules, isDataLoaded])

  useEffect(() => {
    if (selectedModel === "random") {
      setSelectedModelInfo(null)
    } else {
      const modelInfo = availableModels.find((m) => m.model === selectedModel)
      setSelectedModelInfo(modelInfo || null)
    }
  }, [selectedModel, availableModels])

  const handleHistoryDownload = useCallback(
    async (historyItem) => {
      if (!historyItem.user_agents || historyItem.user_agents.length === 0) {
        showModal("❌ No Data!", "No user agents found in this history.", "error")
        return
      }

      showModal(
        "📥 Download History",
        `Do you want to download ${historyItem.user_agents.length} user agents again?`,
        "info",
        async () => {
          setModal((prev) => ({ ...prev, isOpen: false }))

          try {
            const content = historyItem.user_agents.join("\n")
            const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url

            const appTypeDisplay = historyItem.app_type.replace("android_", "android-")
            const timestamp = new Date(historyItem.generated_at).toISOString().slice(0, 19).replace(/:/g, "-")
            a.download = `${appTypeDisplay}_user_agents_${timestamp}.txt`

            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            showModal(
              "✅ Download Successful!",
              `${historyItem.user_agents.length} user agents downloaded successfully.`,
              "success",
            )
          } catch (error) {
            console.error("Error downloading from history:", error)
            showModal("❌ Download Failed!", "Error occurred while downloading!", "error")
          }
        },
        true,
      )
    },
    [showModal],
  )

  const handleHistoryCopy = useCallback(
    async (historyItem) => {
      if (!historyItem.user_agents || historyItem.user_agents.length === 0) {
        showModal("❌ No Data!", "No user agents found in this history.", "error")
        return
      }

      try {
        const content = historyItem.user_agents.join("\n")
        await navigator.clipboard.writeText(content)

        showModal(
          "✅ Copy Successful!",
          `${historyItem.user_agents.length} user agents copied successfully.`,
          "success",
        )
      } catch (error) {
        console.error("Error copying from history:", error)
        showModal("❌ Copy Failed!", "Error occurred while copying!", "error")
      }
    },
    [showModal],
  )

  const parseIOSVersion = (version) => {
    return version.split(".").map(Number)
  }

  const compareVersions = (v1, v2) => {
    const version1 = parseIOSVersion(v1)
    const version2 = parseIOSVersion(v2)

    for (let i = 0; i < Math.max(version1.length, version2.length); i++) {
      const a = version1[i] || 0
      const b = version2[i] || 0
      if (a < b) return -1
      if (a > b) return 1
    }
    return 0
  }

  const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)]
  }

  const extractModelIdentifier = (modelName) => {
    if (!modelName) return modelName
    const match = modelName.match(/^([^\s(]+)/)
    return match ? match[1] : modelName
  }

  const getApiLevel = (version) => {
    const apiLevels = {
      "7.0": "24",
      "7.1": "25",
      "8.0": "26",
      "8.1": "27",
      "9": "28",
      "10": "29",
      "11": "30",
      "12": "31",
      "13": "33",
      "14": "34",
      "15": "35",
      "16": "36",
    }
    return apiLevels[version] || "35" // Latest API level as fallback
  }

  const generateAndroidInstagramUserAgent = async (
    cachedBuildNumbers = null,
    specificModel = null,
    cachedDevices = null,
  ) => {
    try {
      if (!instagramDeviceModels.length || !instagramVersions.length || !chromeVersions.length) {
        console.error("Missing Instagram configuration data")
        return null
      }

      const versionPairs = {
        "7": "24/7.0",
        "7.1": "25/7.1",
        "8": "26/8.0",
        "8.1": "27/8.1",
        "9": "28/9",
        "10": "29/10",
        "11": "30/11",
        "12": "31/12",
        "13": "33/13",
        "14": "34/14",
        "15": "35/15",
      }

      const languageConfig = configurations.languages
      if (!languageConfig) {
        throw new Error("Language configuration not found in database. Please configure languages in admin panel.")
      }

      let languagePercentages: { [key: string]: number }
      try {
        languagePercentages = typeof languageConfig === "string" ? JSON.parse(languageConfig) : languageConfig
      } catch (error) {
        throw new Error("Invalid language configuration format in database")
      }

      const devicePool =
        cachedDevices || instagramDeviceModels.filter((device) => device.manufacturer?.toLowerCase() === "samsung")

      if (devicePool.length === 0) {
        console.log("[v0] No Samsung devices found, using all devices")
      }

      let device
      if (specificModel && specificModel !== "random") {
        device = devicePool.find((d) => (d.model || d.model_name) === specificModel)
        if (!device) {
          console.log(`[v0] Specific model ${specificModel} not found, using random`)
          device = devicePool[Math.floor(Math.random() * devicePool.length)]
        }
      } else {
        device = devicePool[Math.floor(Math.random() * devicePool.length)]
      }

      const androidVersion = device.android_version.toString()

      const versionPair = versionPairs[androidVersion] || `28/${androidVersion}`

      let instagramBuildNumbers = cachedBuildNumbers
      if (!instagramBuildNumbers) {
        const { InstagramBuildNumber } = supabaseModules
        instagramBuildNumbers = (await InstagramBuildNumber?.list()) || []
      }

      let matchingBuildNumbers = instagramBuildNumbers.filter((bn) => bn.android_version === androidVersion)

      if (matchingBuildNumbers.length === 0) {
        const androidVersionNum = Number.parseFloat(androidVersion)
        matchingBuildNumbers = instagramBuildNumbers.filter((bn) => {
          const bnVersion = Number.parseFloat(bn.android_version)
          return Math.abs(bnVersion - androidVersionNum) <= 2
        })

        if (matchingBuildNumbers.length === 0) {
          matchingBuildNumbers = instagramBuildNumbers.filter((bn) => bn.is_active !== false)
        }

        if (matchingBuildNumbers.length === 0) {
          matchingBuildNumbers = instagramBuildNumbers
        }
      }

      if (matchingBuildNumbers.length === 0) {
        throw new Error(
          `No build numbers found for Samsung device with Android version ${androidVersion}. Please add build numbers in admin panel.`,
        )
      }

      const selectedBuildNumber = matchingBuildNumbers[Math.floor(Math.random() * matchingBuildNumbers.length)]
      const buildNumber = selectedBuildNumber.build_number

      const resolutions = Array.isArray(device.resolutions)
        ? device.resolutions
        : device.resolutions.split(",").map((r) => r.trim())
      const resolution = resolutions[Math.floor(Math.random() * resolutions.length)]

      if (!device.dpi_values || (Array.isArray(device.dpi_values) && device.dpi_values.length === 0)) {
        throw new Error(`No DPI values found for ${device.model || "Unknown"}. Please add DPI values in admin panel.`)
      }

      const dpiValues = Array.isArray(device.dpi_values)
        ? device.dpi_values
        : device.dpi_values.split(",").map((d) => d.trim())
      const dpi = `${dpiValues[Math.floor(Math.random() * dpiValues.length)]}dpi`

      const language = getWeightedRandomLanguage(languagePercentages)

      const instagramVersion = instagramVersions[Math.floor(Math.random() * instagramVersions.length)]
      const chromeVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)]

      const instagramVersionString =
        instagramVersion.version || instagramVersion.app_version || instagramVersion.toString()
      const chromeVersionString = chromeVersion.version || chromeVersion.chrome_version || chromeVersion.toString()

      const chipset = device.chipset
      const deviceCode = device.code || device.device_codename

      // If chipset is missing, throw error
      if (!chipset) {
        throw new Error(`No chipset found for ${device.model || "Unknown"}. Please add chipset in admin panel.`)
      }

      // If device code is missing, throw error
      if (!deviceCode) {
        throw new Error(`No device code found for ${device.model || "Unknown"}. Please add device code in admin panel.`)
      }

      const baseUniqueId = instagramVersion.unique_id || instagramVersion.version_code || "312001103"
      const baseUniqueIdStr = baseUniqueId.toString()

      // Keep first digits fixed, randomize last 5 digits
      const fixedPrefix = baseUniqueIdStr.length > 5 ? baseUniqueIdStr.slice(0, -5) : baseUniqueIdStr
      const randomSuffix = Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, "0")
      const instagramUniqueId = fixedPrefix + randomSuffix

      const userAgent =
        `Mozilla/5.0 (Linux; Android ${androidVersion}; ${device.model || "Unknown"} Build/${buildNumber}) ` +
        `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/${chromeVersionString} Mobile Safari/537.36 ` +
        `Instagram ${instagramVersionString} Android (${versionPair}; ${dpi}; ${resolution}; samsung; ${device.model || "Unknown"}; ${deviceCode}; ${chipset}; ${language}; ${instagramUniqueId}; IABMV/1)`

      return userAgent
    } catch (error) {
      console.error("Error generating Samsung Instagram user agent:", error)
      return null
    }
  }

  const generateSamsungInstagramUserAgent = async (
    specificModel = null,
    cachedBuildNumbers = null,
    cachedDevices = null,
  ) => {
    try {
      if (!androidDeviceModels.length || !androidAppVersions.length) {
        throw new Error("Device models or app versions not loaded")
      }

      const languageConfig = configurations.languages
      if (!languageConfig) {
        throw new Error("Language configuration not found in database. Please configure languages in admin panel.")
      }

      let languagePercentages: { [key: string]: number }
      try {
        languagePercentages = typeof languageConfig === "string" ? JSON.parse(languageConfig) : languageConfig
      } catch (error) {
        throw new Error("Invalid language configuration format in database")
      }

      const device = specificModel || androidDeviceModels[Math.floor(Math.random() * androidDeviceModels.length)]

      if (!device) {
        throw new Error("No device selected")
      }

      if (!device.dpi_values || (Array.isArray(device.dpi_values) && device.dpi_values.length === 0)) {
        throw new Error(`No DPI values found for ${device.model || "Unknown"}. Please add DPI values in admin panel.`)
      }

      const androidVersion = device.android_version || 13
      const versionPair = `${androidVersion}/13`

      const matchingBuildNumbers = (cachedBuildNumbers || androidBuildNumbers).filter(
        (bn) => bn.device_id === device.id && bn.android_version === androidVersion,
      )

      if (matchingBuildNumbers.length === 0) {
        throw new Error(
          `No build numbers found for Samsung device with Android version ${androidVersion}. Please add build numbers in admin panel.`,
        )
      }

      const selectedBuildNumber = matchingBuildNumbers[Math.floor(Math.random() * matchingBuildNumbers.length)]
      const buildNumber = selectedBuildNumber.build_number

      const resolutions = Array.isArray(device.resolutions)
        ? device.resolutions
        : device.resolutions.split(",").map((r) => r.trim())
      const resolution = resolutions[Math.floor(Math.random() * resolutions.length)]

      const dpiValues = Array.isArray(device.dpi_values)
        ? device.dpi_values
        : device.dpi_values.split(",").map((d) => d.trim())
      const dpi = `${dpiValues[Math.floor(Math.random() * dpiValues.length)]}dpi`

      const language = getWeightedRandomLanguage(languagePercentages)

      const instagramVersion = instagramVersions[Math.floor(Math.random() * instagramVersions.length)]
      const chromeVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)]

      const instagramVersionString =
        instagramVersion.version || instagramVersion.app_version || instagramVersion.toString()
      const chromeVersionString = chromeVersion.version || chromeVersion.chrome_version || chromeVersion.toString()

      const chipset = device.chipset
      const deviceCode = device.code || device.device_codename

      // If chipset is missing, throw error
      if (!chipset) {
        throw new Error(`No chipset found for ${device.model || "Unknown"}. Please add chipset in admin panel.`)
      }

      // If device code is missing, throw error
      if (!deviceCode) {
        throw new Error(`No device code found for ${device.model || "Unknown"}. Please add device code in admin panel.`)
      }

      const instagramUniqueId = instagramVersion.unique_id || instagramVersion.version_code || "123456789"

      const userAgent =
        `Mozilla/5.0 (Linux; Android ${androidVersion}; ${device.model || "Unknown"} Build/${buildNumber}) ` +
        `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/${chromeVersionString} Mobile Safari/537.36 ` +
        `Instagram ${instagramVersionString} Android (${versionPair}; ${dpi}; ${resolution}; samsung; ${device.model || "Unknown"}; ${deviceCode}; ${chipset}; ${language}; ${instagramUniqueId}; IABMV/1)`

      return userAgent
    } catch (error) {
      console.error("Error generating Samsung Instagram user agent:", error)
      return null
    }
  }

  const generateSamsungFacebookUserAgent = async (
    specificModel = null,
    cachedBuildNumbers = null,
    cachedDevices = null,
  ) => {
    try {
      if (!androidDeviceModels.length || !androidAppVersions.length) {
        console.error("Missing Facebook configuration data")
        return null
      }

      const languageConfig = configurations.languages
      if (!languageConfig) {
        throw new Error("Language configuration not found in database. Please configure languages in admin panel.")
      }

      let languagePercentages: { [key: string]: number }
      try {
        languagePercentages = typeof languageConfig === "string" ? JSON.parse(languageConfig) : languageConfig
      } catch (error) {
        throw new Error("Invalid language configuration format in database")
      }

      const devicePool =
        cachedDevices || androidDeviceModels.filter((device) => device.manufacturer?.toLowerCase() === "samsung")

      if (devicePool.length === 0) {
        console.log("[v0] No Samsung devices found, using all devices")
      }

      let device
      if (specificModel && specificModel !== "random") {
        device = devicePool.find((d) => (d.model_name || d.model) === specificModel)
        if (!device) {
          console.log(`[v0] Specific model ${specificModel} not found, using random`)
          device = devicePool[Math.floor(Math.random() * devicePool.length)]
        }
      } else {
        device = devicePool[Math.floor(Math.random() * devicePool.length)]
      }

      const androidVersionRaw = device.android_version.toString()
      const androidVersion = androidVersionRaw.replace(/[^\d.]/g, "") // "Android 12" → "12"
      // </CHANGE>

      console.log("[v0] ===== Samsung Facebook Build Number Selection Debug =====")
      console.log("[v0] Selected Samsung device:", device.model_name || device.model)
      console.log("[v0] Device Android version (raw):", androidVersionRaw, "Type:", typeof androidVersionRaw)
      console.log("[v0] Device Android version (extracted):", androidVersion, "Type:", typeof androidVersion)

      let samsungBuildNumbers = cachedBuildNumbers
      if (!samsungBuildNumbers) {
        const { SamsungInstagramBuildNumber } = supabaseModules
        samsungBuildNumbers = (await SamsungInstagramBuildNumber?.list()) || []
      }

      console.log("[v0] Total Samsung build numbers available:", samsungBuildNumbers.length)

      // Log first few build numbers to see their structure
      if (samsungBuildNumbers.length > 0) {
        console.log("[v0] Sample build number data (first 3):")
        samsungBuildNumbers.slice(0, 3).forEach((bn, idx) => {
          console.log(
            `[v0]   ${idx + 1}. android_version: "${bn.android_version}" (type: ${typeof bn.android_version}), build_number: "${bn.build_number}"`,
          )
        })
      }

      console.log(
        "[v0] Available Android versions in Samsung build numbers:",
        [...new Set(samsungBuildNumbers.map((bn) => bn.android_version))].sort(),
      )

      // Try exact match with string comparison
      let matchingBuildNumbers = samsungBuildNumbers.filter((bn) => {
        const match = bn.android_version === androidVersion
        if (match) {
          console.log(
            `[v0] Exact match found: bn.android_version="${bn.android_version}" === androidVersion="${androidVersion}"`,
          )
        }
        return match
      })

      console.log(`[v0] Found ${matchingBuildNumbers.length} exact Samsung build numbers for Android ${androidVersion}`)

      // If no exact match, try with type conversion
      if (matchingBuildNumbers.length === 0) {
        console.log("[v0] No exact match, trying with type conversion...")
        matchingBuildNumbers = samsungBuildNumbers.filter((bn) => {
          const bnVersionStr = bn.android_version?.toString()
          const match = bnVersionStr === androidVersion
          if (match) {
            console.log(`[v0] Match with conversion: "${bnVersionStr}" === "${androidVersion}"`)
          }
          return match
        })
        console.log(`[v0] Found ${matchingBuildNumbers.length} build numbers after type conversion`)
      }

      if (matchingBuildNumbers.length === 0) {
        console.log(
          `[v0] No exact Samsung build numbers for Android ${androidVersion}, trying compatible versions (±2)`,
        )

        const androidVersionNum = Number.parseFloat(androidVersion)
        console.log("[v0] Android version as number:", androidVersionNum)

        matchingBuildNumbers = samsungBuildNumbers.filter((bn) => {
          const bnVersion = Number.parseFloat(bn.android_version)
          const diff = Math.abs(bnVersion - androidVersionNum)
          const isCompatible = diff <= 2
          if (isCompatible) {
            console.log(`[v0] Compatible version found: ${bn.android_version} (diff: ${diff})`)
          }
          return isCompatible
        })

        console.log(`[v0] Found ${matchingBuildNumbers.length} compatible Samsung build numbers within ±2 versions`)
      }

      if (matchingBuildNumbers.length === 0) {
        console.log("[v0] No compatible Samsung build numbers found, trying active build numbers")
        matchingBuildNumbers = samsungBuildNumbers.filter((bn) => bn.is_active !== false)
        console.log(`[v0] Found ${matchingBuildNumbers.length} active Samsung build numbers`)
      }

      if (matchingBuildNumbers.length === 0) {
        console.log("[v0] No active Samsung build numbers found, using any available build numbers")
        matchingBuildNumbers = samsungBuildNumbers
        console.log(`[v0] Using ${matchingBuildNumbers.length} total available build numbers`)
      }

      if (matchingBuildNumbers.length === 0) {
        throw new Error(
          `No Samsung build numbers found for device with Android version ${androidVersion}. Please add build numbers in admin panel.`,
        )
      }

      const selectedBuildNumber = matchingBuildNumbers[Math.floor(Math.random() * matchingBuildNumbers.length)]
      const buildNumber = selectedBuildNumber.build_number
      console.log(
        "[v0] Selected Samsung build number:",
        buildNumber,
        "for Android version:",
        selectedBuildNumber.android_version,
      )
      console.log("[v0] ===== End Samsung Facebook Build Number Selection Debug =====")

      const fbVersions = androidAppVersions.filter((a) => a.app_type === "facebook")
      const chromeVersions = androidAppVersions.filter((a) => a.app_type === "chrome")

      if (fbVersions.length === 0 || chromeVersions.length === 0) {
        throw new Error("No Facebook or Chrome versions available")
      }

      const fbVersion = fbVersions[Math.floor(Math.random() * fbVersions.length)]
      const chromeVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)]

      const modelIdentifier = extractModelIdentifier(device.model_name)

      const userAgent =
        `Mozilla/5.0 (Linux; Android ${androidVersion}; ${modelIdentifier} Build/${buildNumber}) ` +
        `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 ` +
        `Chrome/${chromeVersion.version} Mobile Safari/537.36 ` +
        `[FB_IAB/FB4A;FBAV/${fbVersion.version};IABMV/${fbVersion.iabmv};]`

      console.log("[v0] Generated Samsung Facebook user agent successfully")
      return userAgent
    } catch (error) {
      console.error("Error generating Samsung Facebook user agent:", error)
      return null
    }
  }

  const generateChromeUserAgent = async (specificModel = null) => {
    try {
      console.log("[v0] Generating Chrome user agent, platform:", platform)

      let device
      let chromeVersions
      let buildNumbers

      if (platform === "android") {
        // Samsung এর জন্য Chrome User Agent
        if (!androidDeviceModels.length || !androidAppVersions.length) {
          console.error("Missing Android configuration data for Chrome")
          return null
        }

        const samsungDevices = androidDeviceModels.filter((device) => device.manufacturer?.toLowerCase() === "samsung")
        const devicePool = samsungDevices.length > 0 ? samsungDevices : androidDeviceModels

        if (specificModel && specificModel !== "random") {
          device = devicePool.find((d) => (d.model_name || d.model) === specificModel)
          if (!device) {
            device = devicePool[Math.floor(Math.random() * devicePool.length)]
          }
        } else {
          device = devicePool[Math.floor(Math.random() * devicePool.length)]
        }

        chromeVersions = androidAppVersions.filter((a) => a.app_type === "chrome")
        buildNumbers = androidBuildNumbers

        if (chromeVersions.length === 0) {
          throw new Error("No Chrome versions available for Samsung")
        }

        const androidVersion = device.android_version.toString()
        let matchingBuildNumbers = buildNumbers.filter((b) => b.android_version === androidVersion)

        if (matchingBuildNumbers.length === 0) {
          const androidVersionNum = Number.parseFloat(androidVersion)
          matchingBuildNumbers = buildNumbers.filter((bn) => {
            const bnVersion = Number.parseFloat(bn.android_version)
            return Math.abs(bnVersion - androidVersionNum) <= 2
          })
        }

        if (matchingBuildNumbers.length === 0) {
          matchingBuildNumbers = buildNumbers
        }

        const selectedBuildNumber = matchingBuildNumbers[Math.floor(Math.random() * matchingBuildNumbers.length)]
        const chromeVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)]
        const modelIdentifier = extractModelIdentifier(device.model_name)

        const userAgent =
          `Mozilla/5.0 (Linux; Android ${androidVersion}; ${modelIdentifier} Build/${selectedBuildNumber.build_number}) ` +
          `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 ` +
          `Chrome/${chromeVersion.version} Mobile Safari/537.36`

        console.log("[v0] Generated Samsung Chrome user agent successfully")
        return userAgent
      } else if (platform === "pixel") {
        // Mix (Pixel) এর জন্য Chrome User Agent
        if (!pixelFacebookDeviceModels || pixelFacebookDeviceModels.length === 0) {
          console.log("[v0] No Pixel device models available for Chrome")
          throw new Error("No Pixel device models available")
        }

        if (!pixelFacebookAppVersions || pixelFacebookAppVersions.length === 0) {
          console.log("[v0] No Pixel app versions available for Chrome")
          throw new Error("No Pixel app versions available")
        }

        if (specificModel && specificModel !== "random") {
          device = pixelFacebookDeviceModels.find((d) => (d.model_name || d.device_model || d.model) === specificModel)
          if (!device) {
            device = pixelFacebookDeviceModels[Math.floor(Math.random() * pixelFacebookDeviceModels.length)]
          }
        } else {
          device = pixelFacebookDeviceModels[Math.floor(Math.random() * pixelFacebookDeviceModels.length)]
        }

        chromeVersions = pixelFacebookAppVersions.filter((a) => a.app_type === "chrome")

        if (chromeVersions.length === 0) {
          throw new Error("No Chrome versions available for Pixel")
        }

        const chromeVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)]
        const modelIdentifier = device.model_name || device.device_model || "Pixel"

        const pixelAndroidVersionRaw = device.android_version?.toString() || "13"
        const pixelAndroidVersion = pixelAndroidVersionRaw.replace(/[^\d.]/g, "") // "Android 14" → "14"

        const userAgent =
          `Mozilla/5.0 (Linux; Android ${pixelAndroidVersion}; ${modelIdentifier} Build/${device.build_number}) ` +
          `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 ` +
          `Chrome/${chromeVersion.version || "136.0.7195.102"} Mobile Safari/537.36`

        console.log("[v0] Generated Pixel Chrome user agent successfully")
        return userAgent
      }

      return null
    } catch (error) {
      console.error("Error generating Chrome user agent:", error)
      return null
    }
  }

  const generateAndroidUserAgent = async (specificModel = null) => {
    try {
      if (appType === "instagram") {
        return await generateAndroidInstagramUserAgent(null, specificModel)
      }

      if (appType === "chrome") {
        return await generateChromeUserAgent(specificModel)
      }

      if (deviceType === "samsung") {
        return await generateSamsungFacebookUserAgent(specificModel)
      }

      const device = androidDeviceModels[Math.floor(Math.random() * androidDeviceModels.length)]
      if (!device) throw new Error("No Android device models available")

      const androidVersion = device.android_version.toString()
      const androidVersionNum = Number.parseFloat(androidVersion)

      // Try exact match first
      let matchingBuildNumbers = androidBuildNumbers.filter((b) => b.android_version === androidVersion)

      // If no exact match, try compatible versions (±2)
      if (matchingBuildNumbers.length === 0) {
        matchingBuildNumbers = androidBuildNumbers.filter((bn) => {
          const bnVersion = Number.parseFloat(bn.android_version)
          return Math.abs(bnVersion - androidVersionNum) <= 2
        })
      }

      // If still no match, try any active build numbers
      if (matchingBuildNumbers.length === 0) {
        matchingBuildNumbers = androidBuildNumbers.filter((bn) => bn.is_active !== false)
      }

      // Final fallback: use any build number
      if (matchingBuildNumbers.length === 0) {
        matchingBuildNumbers = androidBuildNumbers
      }

      // If still no build numbers at all, throw error
      if (matchingBuildNumbers.length === 0) {
        throw new Error(`No build numbers available in database. Please add build numbers in admin panel.`)
      }

      const buildNumber = matchingBuildNumbers[Math.floor(Math.random() * matchingBuildNumbers.length)]
      // </CHANGE>

      const fbVersions = androidAppVersions.filter((a) => a.app_type === "facebook")
      const chromeVersions = androidAppVersions.filter((a) => a.app_type === "chrome")

      if (fbVersions.length === 0 || chromeVersions.length === 0) {
        throw new Error("No Facebook or Chrome versions available")
      }

      const fbVersion = fbVersions[Math.floor(Math.random() * fbVersions.length)]
      const chromeVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)]

      const modelIdentifier = extractModelIdentifier(device.model_name)

      const userAgent =
        `Mozilla/5.0 (Linux; ${device.android_version}; ${modelIdentifier} Build/${buildNumber.build_number}) ` +
        `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 ` +
        `Chrome/${chromeVersion.version} Mobile Safari/537.36 ` +
        `[FB_IAB/FB4A;FBAV/${fbVersion.version};IABMV/${fbVersion.iabmv};]`

      return userAgent
    } catch (error) {
      console.error("Error generating Android user agent:", error)
      return null
    }
  }

  const getWeightedRandomLanguage = (percentages) => {
    // Filter out languages with 0% usage
    const validLanguages = Object.entries(percentages).filter(([lang, percentage]) => percentage > 0)

    if (validLanguages.length === 0) {
      throw new Error("No languages with valid percentages found")
    }

    // Calculate total percentage of valid languages
    const totalPercentage = validLanguages.reduce((sum, [lang, percentage]) => sum + percentage, 0)

    if (totalPercentage <= 0) {
      throw new Error("Total language percentage must be greater than 0")
    }

    // Normalize percentages to ensure they sum to 100
    const normalizedLanguages = validLanguages.map(([lang, percentage]) => [lang, (percentage / totalPercentage) * 100])

    const random = Math.random() * 100
    let cumulative = 0

    for (const [lang, percentage] of normalizedLanguages) {
      cumulative += percentage
      if (random <= cumulative) {
        return lang
      }
    }

    // Fallback to first valid language if something goes wrong
    return normalizedLanguages[0][0]
  }

  const generatePixelUserAgent = async (specificModel = null, cachedDevices = null) => {
    try {
      console.log("[v0] Generating Pixel user agent, appType:", appType)

      if (appType === "chrome") {
        return await generateChromeUserAgent(specificModel)
      }

      if (appType === "instagram") {
        return await generatePixelInstagramUserAgent(specificModel, cachedDevices)
      }

      const deviceModels = cachedDevices || pixelFacebookDeviceModels

      if (!deviceModels || deviceModels.length === 0) {
        console.log("[v0] No Pixel Facebook device models available")
        throw new Error("No Pixel device models available")
      }

      if (!pixelFacebookAppVersions || pixelFacebookAppVersions.length === 0) {
        console.log("[v0] No Pixel Facebook app versions available")
        throw new Error("No Pixel Facebook app versions available")
      }

      let device
      if (specificModel && specificModel !== "random") {
        device = deviceModels.find((d) => (d.model_name || d.device_model || d.model) === specificModel)
        if (!device) {
          console.log(`[v0] Specific model ${specificModel} not found, using random`)
          device = deviceModels[Math.floor(Math.random() * deviceModels.length)]
        }
      } else {
        device = deviceModels[Math.floor(Math.random() * deviceModels.length)]
      }

      const fbVersions = pixelFacebookAppVersions.filter((a) => a.app_type === "facebook")
      const chromeVersions = pixelFacebookAppVersions.filter((a) => a.app_type === "chrome")

      if (fbVersions.length === 0 || chromeVersions.length === 0) {
        throw new Error("No Facebook or Chrome versions available for Pixel")
      }

      const fbVersion = fbVersions[Math.floor(Math.random() * fbVersions.length)]
      const chromeVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)]

      const modelIdentifier = device.model_name || device.device_model || "Pixel"

      const userAgent =
        `Mozilla/5.0 (Linux; ${device.android_version || "13"}; ${modelIdentifier} Build/${device.build_number}) ` +
        `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 ` +
        `Chrome/${chromeVersion.version || "136.0.7195.102"} Mobile Safari/537.36 ` +
        `[FB_IAB/FB4A;FBAV/${fbVersion.version || "445.0.0.33.118"};IABMV/${fbVersion.iabmv || "1"};]`

      return userAgent
    } catch (error) {
      console.error("Error generating Pixel user agent:", error)
      return null
    }
  }

  const generatePixelInstagramUserAgent = async (
    specificModel = null,
    cachedBuildNumbers = null,
    cachedDevices = null,
  ) => {
    try {
      if (!pixelInstagramDeviceModels.length || !pixelInstagramVersions.length) {
        throw new Error("Pixel Instagram devices or versions not loaded")
      }

      const device =
        specificModel || pixelInstagramDeviceModels[Math.floor(Math.random() * pixelInstagramDeviceModels.length)]

      if (!device) {
        throw new Error("No Pixel device selected")
      }

      if (!device.dpi_values || (Array.isArray(device.dpi_values) && device.dpi_values.length === 0)) {
        throw new Error(`No DPI values found for ${device.model || "Unknown"}. Please add DPI values in admin panel.`)
      }

      if (!pixelInstagramResolutionDpis || pixelInstagramResolutionDpis.length === 0) {
        console.log("[v0] No Pixel Instagram resolution DPIs available")
        throw new Error("No Pixel Instagram resolution DPIs available")
      }

      const version = pixelInstagramVersions[Math.floor(Math.random() * pixelInstagramVersions.length)]
      const chromeVersion =
        pixelInstagramChromeVersions[Math.floor(Math.random() * pixelInstagramChromeVersions.length)]

      // Get device's supported resolutions
      const resolutions = Array.isArray(device.resolutions)
        ? device.resolutions
        : device.resolutions.split(",").map((r) => r.trim())

      // Pick a random resolution from device's capabilities
      const resolution = resolutions[Math.floor(Math.random() * resolutions.length)]

      const dpiValues = Array.isArray(device.dpi_values)
        ? device.dpi_values
        : device.dpi_values.split(",").map((d) => d.trim())
      const dpi = `${dpiValues[Math.floor(Math.random() * dpiValues.length)]}dpi`

      console.log("[v0] Selected device:", device)
      console.log("[v0] Device resolutions:", resolutions)
      console.log("[v0] Selected resolution:", resolution)
      console.log("[v0] Device DPI values:", dpiValues)
      console.log("[v0] Selected DPI:", dpi)
      console.log("[v0] Selected version:", version)
      console.log("[v0] Selected chrome version:", chromeVersion)

      const modelIdentifier = device.model || device.model_name || device.device_model || "Pixel"

      const manufacturer = device.manufacturer ? `Google/${device.manufacturer}` : "Google/google"

      const deviceCodename = device.code || device.device_codename || "panther"
      const doubleCodename = `${deviceCodename}; ${deviceCodename}`

      const buildNumber =
        device.build_number ||
        (() => {
          throw new Error("No build number found for this device. Please configure build numbers in admin panel.")
        })()
      const androidVersion = device.android_version || 13
      const apiLevel = getApiLevel(androidVersion.toString()) || "35"

      const userAgent =
        `Mozilla/5.0 (Linux; Android ${androidVersion}; ${modelIdentifier} Build/${buildNumber}) ` +
        `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 ` +
        `Chrome/${chromeVersion.version || "136.0.7195.102"} Mobile Safari/537.36 ` +
        `Instagram ${version.version || "312.0.0.37.103"} Android (${apiLevel}/${androidVersion}; ${dpi}; ` +
        `${resolution}; ${manufacturer}; ${modelIdentifier}; ${doubleCodename}; ${device.locale || "en_US"}; ${version.version_code || version.unique_id || "312001103"}; IABMV/1)`

      console.log("[v0] Generated Pixel Instagram user agent:", userAgent)
      return userAgent
    } catch (error) {
      console.error("Error generating Pixel Instagram user agent:", error)
      return null
    }
  }

  const generateUserAgent = (
    platform,
    appType,
    deviceModels,
    iosVersions,
    appVersions,
    configurations,
    blacklistedUAs,
    androidDeviceModels,
    androidBuildNumbers,
    androidAppVersions,
    instagramDeviceModels,
    instagramVersions,
    chromeVersions,
    resolutionDpis,
  ) => {
    if (platform === "pixel") {
      return generatePixelUserAgent()
    } else if (platform === "android") {
      return generateAndroidUserAgent()
    } else {
      try {
        const device = getRandomElement(deviceModels)
        if (!device) throw new Error("No device models available")

        const validIOSVersions = iosVersions.filter((ios) => {
          const versionCompareMin = compareVersions(ios.version, device.min_ios_version)
          const versionCompareMax = compareVersions(ios.version, device.max_ios_version)
          return versionCompareMin >= 0 && versionCompareMax <= 0
        })

        if (validIOSVersions.length === 0) {
          return generateUserAgent(
            platform,
            appType,
            deviceModels,
            iosVersions,
            appVersions,
            configurations,
            blacklistedUAs,
            androidDeviceModels,
            androidBuildNumbers,
            androidAppVersions,
            instagramDeviceModels,
            instagramVersions,
            chromeVersions,
            resolutionDpis,
          )
        }

        const iosVersion = getRandomElement(validIOSVersions)
        const appVersionsForType = appVersions.filter((app) => app.app_type === appType)

        if (appVersionsForType.length === 0) {
          throw new Error(`No app versions available for ${appType}`)
        }

        const appVersion = getRandomElement(appVersionsForType)

        const languageConfig = configurations.languages
        if (!languageConfig) {
          throw new Error("Language configuration not found in database. Please configure languages in admin panel.")
        }

        let languagePercentages: { [key: string]: number }
        try {
          languagePercentages = typeof languageConfig === "string" ? JSON.parse(languageConfig) : languageConfig
        } catch (error) {
          throw new Error("Invalid language configuration format in database")
        }

        const language = getWeightedRandomLanguage(languagePercentages)

        const deviceResolutions = device.resolutions && device.resolutions.length > 0 ? device.resolutions : []
        const deviceScaling = device.screen_scaling && device.screen_scaling.length > 0 ? device.screen_scaling : []

        if (deviceResolutions.length === 0) {
          throw new Error(`Device ${device.model_name} has no resolution data in database`)
        }
        if (deviceScaling.length === 0) {
          throw new Error(`Device ${device.model_name} has no scaling data in database`)
        }

        let userAgent

        const modelIdentifier = extractModelIdentifier(device.model_name)

        if (appType === "instagram") {
          console.log("[v0] Generating Instagram iOS user agent...")
          console.log("[v0] Device resolutions:", deviceResolutions)
          console.log("[v0] Device scaling:", deviceScaling)
          console.log("[v0] Selected resolution:", getRandomElement(deviceResolutions))
          console.log("[v0] Selected scaling:", getRandomElement(deviceScaling))

          const languageCode = language.split("_")[0]
          const selectedResolution = getRandomElement(deviceResolutions)
          const selectedScaling = getRandomElement(deviceScaling)

          userAgent =
            `Mozilla/5.0 (iPhone; CPU iPhone OS ${iosVersion.version.replace(/\./g, "_")} like Mac OS X) ` +
            `AppleWebKit/${iosVersion.webkit_version} (KHTML, like Gecko) Mobile/${iosVersion.build_number} ` +
            `Instagram ${appVersion.version} (${modelIdentifier}; iOS ${iosVersion.version.replace(/\./g, "_")}; ${language}; ${languageCode}; ` +
            `scale=${selectedScaling}; ${selectedResolution}; IABMV/1; ${appVersion.build_number})`

          console.log("[v0] Generated Instagram iOS user agent:", userAgent)
        } else {
          const fbss = getRandomElement(deviceScaling.map((s) => s.replace(".00", "")))
          const extra = Math.random() < 0.1 ? ";FBOP/80" : ""

          let fbrv = appVersion.fbrv
          if (fbrv) {
            fbrv = fbrv.toString()
          } else {
            fbrv = (Math.floor(Math.random() * 999999) + 700000000).toString()
          }

          const fbrv_part = extra ? "" : `;FBOP/5;FBRV/${fbrv}`
          const iabmv = Math.random() < 0.9 ? ";IABMV/1" : ""

          userAgent =
            `Mozilla/5.0 (iPhone; CPU iPhone OS ${iosVersion.version.replace(/\./g, "_")} like Mac OS X) ` +
            `AppleWebKit/${iosVersion.webkit_version} (KHTML, like Gecko) Mobile/${iosVersion.build_number} ` +
            `[FBAN/FBIOS;FBAV/${appVersion.version};FBBV/${appVersion.build_number};FBDV/${modelIdentifier};FBMD/iPhone;FBSN/iOS;` +
            `FBSV/${iosVersion.version};FBSS/${fbss};FBID/phone;FBLC/${language}${extra}${fbrv_part}${iabmv}]`
        }

        return userAgent
      } catch (error) {
        console.error("Error generating user agent:", error)
        return null
      }
    }
  }

  const preloadCachedData = useCallback(async () => {
    if (!supabaseModules) return null

    try {
      console.log("[v0] Pre-loading cached data for fast generation...")

      const { InstagramBuildNumber } = supabaseModules

      // Load Instagram build numbers (used for both Samsung Instagram and Facebook)
      const instagramBuildNumbers = (await InstagramBuildNumber?.list()) || []
      // </CHANGE>

      // Pre-filter Samsung devices for Instagram
      const samsungInstaDevices = instagramDeviceModels.filter(
        (device) => device.manufacturer?.toLowerCase() === "samsung",
      )

      // Pre-filter Samsung devices for Facebook
      const samsungFbDevices = androidDeviceModels.filter((device) => device.manufacturer?.toLowerCase() === "samsung")

      const cached = {
        instagramBuildNumbers: instagramBuildNumbers,
        facebookBuildNumbers: instagramBuildNumbers, // Same table for both
        // </CHANGE>
        samsungInstagramDevices: samsungInstaDevices.length > 0 ? samsungInstaDevices : instagramDeviceModels,
        samsungFacebookDevices: samsungFbDevices.length > 0 ? samsungFbDevices : androidDeviceModels,
        pixelFacebookDevices: pixelFacebookDeviceModels,
        pixelInstagramDevices: pixelInstagramDeviceModels,
      }

      console.log("[v0] Cached Instagram build numbers:", cached.instagramBuildNumbers?.length || 0)
      console.log("[v0] Cached Facebook build numbers (same table):", cached.facebookBuildNumbers?.length || 0)
      console.log("[v0] Cached Samsung Instagram devices:", cached.samsungInstagramDevices?.length || 0)
      console.log("[v0] Cached Samsung Facebook devices:", cached.samsungFacebookDevices?.length || 0)
      console.log("[v0] Cached Pixel Facebook devices:", cached.pixelFacebookDevices?.length || 0)
      console.log("[v0] Cached Pixel Instagram devices:", cached.pixelInstagramDevices?.length || 0)

      setCachedData(cached)
      return cached
    } catch (error) {
      console.error("[v0] Error pre-loading cached data:", error)
      return null
    }
  }, [
    supabaseModules,
    instagramDeviceModels,
    androidDeviceModels,
    pixelFacebookDeviceModels,
    pixelInstagramDeviceModels,
  ])

  // Renamed generateUserAgents to handleGenerate and adjusted parameters
  const handleGenerate = useCallback(async () => {
    if (!supabaseModules || connectionError) {
      showModal("❌ Database Connection Error!", "No database connection. Please refresh the page.", "error")
      return
    }

    abortControllerRef.current = new AbortController()

    setIsGenerating(true)
    setGenerationProgress(0)
    setUserAgents([])

    showProgressModal("🚀 User Agent Generation Started", "Processing started...", 0, "info", true)

    try {
      const newUserAgents = []
      const usedUserAgents = new Set()

      const maxAttempts = Math.max(quantity * 100, 50000)
      let attempts = 0
      let consecutiveFailures = 0
      const maxConsecutiveFailures = 500
      let lastProgressUpdate = 0

      const cached = await preloadCachedData()

      console.log(`[v0] Starting generation: ${quantity} requested`)
      console.log(`[v0] Blacklisted UAs: ${blacklistedUAs.size}`)
      console.log(`[v0] Selected model: ${selectedModel}`)

      while (
        newUserAgents.length < quantity &&
        attempts < maxAttempts &&
        consecutiveFailures < maxConsecutiveFailures
      ) {
        if (abortControllerRef.current?.signal.aborted) {
          console.log("[v0] Generation cancelled by user")
          break
        }

        attempts++

        let userAgent = null

        try {
          const modelToUse = selectedModel === "random" ? null : selectedModel

          if (platform === "android") {
            if (appType === "instagram") {
              userAgent = await generateAndroidInstagramUserAgent(
                cached?.instagramBuildNumbers,
                modelToUse,
                cached?.samsungInstagramDevices,
              )
            } else if (appType === "facebook") {
              userAgent = await generateSamsungFacebookUserAgent(
                modelToUse,
                cached?.facebookBuildNumbers,
                cached?.samsungFacebookDevices,
              )
              // </CHANGE>
            } else if (appType === "chrome") {
              userAgent = await generateChromeUserAgent(modelToUse)
            } else {
              userAgent = await generateAndroidUserAgent(modelToUse)
            }
          } else if (platform === "ios") {
            userAgent = generateUserAgent(
              platform,
              appType,
              deviceModels,
              iosVersions,
              appVersions,
              configurations,
              blacklistedUAs,
              androidDeviceModels,
              androidBuildNumbers,
              androidAppVersions,
              instagramDeviceModels,
              instagramVersions,
              chromeVersions,
              resolutionDpis,
            )
          } else if (platform === "pixel") {
            if (appType === "instagram") {
              userAgent = await generatePixelInstagramUserAgent(modelToUse, cached?.pixelInstagramDevices)
            } else {
              userAgent = await generatePixelUserAgent(modelToUse, cached?.pixelFacebookDevices)
            }
          }

          if (userAgent && !newUserAgents.includes(userAgent)) {
            newUserAgents.push(userAgent)
            consecutiveFailures = 0
          } else {
            consecutiveFailures++
          }
        } catch (error) {
          console.error("Error generating user agent:", error)
          consecutiveFailures++
        }

        const now = Date.now()
        if (now - lastProgressUpdate > 100) {
          lastProgressUpdate = now
          const progress = Math.round((newUserAgents.length / quantity) * 100)
          const successRate = attempts > 0 ? Math.round((newUserAgents.length / attempts) * 100) : 0

          startTransition(() => {
            setGenerationProgress(progress)
            setProgressModal((prev) => ({
              ...prev,
              progress,
              message: `⚡ ${newUserAgents.length}/${quantity} unique user agents generated\n📊 Success rate: ${successRate}%\n🔄 Attempts: ${attempts}/${maxAttempts}`,
            }))
          })

          await new Promise((resolve) => setTimeout(resolve, 1))
        }

        // No delay needed for any platform now
      }

      if (abortControllerRef.current?.signal.aborted) {
        setIsGenerating(false)
        hideProgressModal()
        return
      }

      const finalUserAgents = newUserAgents.slice(0, quantity)
      const actualGenerated = finalUserAgents.length

      startTransition(() => {
        setUserAgents(finalUserAgents)
      })

      if (actualGenerated === quantity) {
        setProgressModal((prev) => ({
          ...prev,
          progress: 100,
          title: "✅ Job Successful",
          message: `🎉 ${quantity} unique user agents generated successfully!\n⚡ Total attempts: ${attempts}\n✨ Job completed!`,
          type: "success",
          showCancel: false,
        }))

        // Auto close after 2 seconds
        setTimeout(() => {
          hideProgressModal()
        }, 2000)
      } else if (actualGenerated > 0) {
        setProgressModal((prev) => ({
          ...prev,
          progress: Math.round((actualGenerated / quantity) * 100),
          title: "⚠️ Job Partially Successful",
          message: `📊 ${actualGenerated} out of ${quantity} unique user agents generated\nWarning: Could not generate more due to blacklist and duplicate avoidance`,
          type: "warning",
          showCancel: false,
        }))

        setTimeout(() => {
          hideProgressModal()
        }, 3000)
      } else {
        setProgressModal((prev) => ({
          ...prev,
          progress: 0,
          title: "❌ Job Failed",
          message: `💥 No unique user agents could be generated\n🚫 All possible combinations may be blacklisted or used`,
          type: "error",
          showCancel: false,
        }))

        setTimeout(() => {
          hideProgressModal()
        }, 3000)
      }

      console.log(`[v0] Generation completed: ${actualGenerated}/${quantity} generated in ${attempts} attempts`)
    } catch (error) {
      console.error("Error generating user agents:", error)
      setProgressModal((prev) => ({
        ...prev,
        progress: 0,
        title: "❌ Job Failed",
        message: `💥 Error occurred while generating user agents\n🔄 Please try again`,
        type: "error",
        showCancel: false,
      }))

      setTimeout(() => {
        hideProgressModal()
      }, 3000)
    } finally {
      setIsGenerating(false)
      // Reset abort controller ref after generation is complete
      abortControllerRef.current = null
    }
  }, [
    platform,
    appType,
    quantity,
    supabaseModules,
    connectionError,
    deviceModels,
    iosVersions,
    appVersions,
    configurations,
    blacklistedUAs,
    androidDeviceModels,
    androidBuildNumbers,
    androidAppVersions,
    instagramDeviceModels,
    instagramVersions,
    chromeVersions,
    resolutionDpis,
    deviceType,
    selectedModel,
    showModal,
    showProgressModal,
    hideProgressModal,
    setUserAgents,
    setGenerationProgress,
    setIsGenerating,
    startTransition,
    setProgressModal,
    preloadCachedData, // Added preloadCachedData to dependencies
  ])

  const addToBlacklist = async () => {
    if (!userAgents.length) return false

    try {
      console.log(`Adding ${userAgents.length} user agents to blacklist...`)

      showProgressModal("⚙️ Processing", "Blacklisting user agents...", 0, "info", false)

      const finalAppType = platform === "android" ? `android_${appType}` : appType
      const { BlacklistedUserAgent } = supabaseModules

      const batchSize = 50 // Increased batch size for better performance
      const totalBatches = Math.ceil(userAgents.length / batchSize)

      for (let batch = 0; batch < totalBatches; batch++) {
        const batchStart = batch * batchSize
        const batchEnd = Math.min(batchStart + batchSize, userAgents.length)
        const batchUAs = userAgents.slice(batchStart, batchEnd)

        const batchDataMap = new Map()

        batchUAs.forEach((ua) => {
          const hash = btoa(ua)
            .replace(/[^a-zA-Z0-9]/g, "")
            .substring(0, 32)

          // Only add if hash doesn't exist in this batch
          if (!batchDataMap.has(hash)) {
            batchDataMap.set(hash, {
              user_agent: ua,
              hash,
              downloaded_by: "anonymous@example.com",
              app_type: finalAppType,
            })
          }
        })

        // Convert map to array for bulk upsert
        const batchData = Array.from(batchDataMap.values())

        try {
          // Use bulk upsert for much better performance
          await BlacklistedUserAgent.bulkCreateOrUpdate(batchData)
        } catch (error) {
          console.error(`Error blacklisting batch ${batch + 1}:`, error)
          throw error
        }

        const progress = Math.round(((batch + 1) / totalBatches) * 100)
        startTransition(() => {
          setProgressModal((prev) => ({
            ...prev,
            progress,
            message: `🔒 ${batchEnd}/${userAgents.length} user agents processed...`,
          }))
        })

        // No delay needed with bulk operations
      }

      console.log(`Successfully blacklisted ${userAgents.length} user agents`)

      await loadData()

      hideProgressModal()
      return true
    } catch (error) {
      console.error("Error during blacklisting process:", error)
      hideProgressModal()
      return false
    }
  }

  const handleDownload = useCallback(async () => {
    if (!userAgents.length) return

    try {
      // const historyId = await GenerationHistory.create({
      //   app_type: appType,
      //   quantity: userAgents.length,
      //   user_agents: userAgents,
      //   is_downloaded: true,
      //   created_by: accessKey?.access_key || "anonymous",
      // })

      const text = userAgents.join("\n")
      const blob = new Blob([text], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `user-agents-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // loadHistory()

      showModal("✅ Download Successful!", `${userAgents.length} user agents downloaded successfully.`, "success")
    } catch (error) {
      console.error("Error downloading file:", error)
      showModal("❌ Error!", "Error occurred while downloading.", "error")
    }
  }, [userAgents, showModal])

  const handleCopyAll = useCallback(async () => {
    if (userAgents.length === 0) return

    try {
      const text = userAgents.join("\n")
      await navigator.clipboard.writeText(text)

      // const historyId = await GenerationHistory.create({
      //   app_type: appType,
      //   quantity: userAgents.length,
      //   user_agents: userAgents,
      //   is_downloaded: false,
      //   created_by: accessKey?.access_key || "anonymous",
      // })

      // loadHistory()

      showModal("✅ Copy Successful!", `${userAgents.length} user agents copied successfully.`, "success")
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      showModal("❌ Error!", "Error occurred while copying.", "error")
    }
  }, [userAgents, showModal])

  const copyToClipboard = useCallback((text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {activeTab === "generator" && (
            <div className="space-y-8">
              <GeneratorControls
                platform={platform}
                setPlatform={setPlatform}
                appType={appType}
                setAppType={setAppType}
                quantity={quantity}
                setQuantity={setQuantity}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                availableModels={availableModels}
                selectedModelInfo={selectedModelInfo}
              />

              {userAgents.length > 0 && (
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                  <CardHeader className="bg-slate-50 dark:bg-slate-800/50 py-3 border-b border-slate-200 dark:border-slate-700">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span className="text-slate-900 dark:text-slate-100">
                        Generated User Agents ({userAgents.length})
                        {userAgents.length > 5 && (
                          <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">
                            (Showing 5 of {userAgents.length})
                          </span>
                        )}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCopyAll}
                          variant="outline"
                          size="sm"
                          className="bg-white dark:bg-slate-700"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy All
                        </Button>
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          size="sm"
                          className="bg-white dark:bg-slate-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {userAgents.slice(0, 5).map((ua, index) => (
                        <div
                          key={index}
                          className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <code className="text-sm text-slate-700 dark:text-slate-300 break-all">{ua}</code>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        showCancel={modal.showCancel}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        isLoading={modal.isLoading}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
      <ProgressModal
        isOpen={progressModal.isOpen}
        title={progressModal.title}
        message={progressModal.message}
        progress={progressModal.progress}
        type={progressModal.type}
        showCancel={progressModal.showCancel}
        onCancel={handleCancelGeneration}
        onClose={() => setProgressModal({ ...progressModal, isOpen: false })}
      />
    </div>
  )
}
