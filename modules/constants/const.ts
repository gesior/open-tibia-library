export enum Direction {
    North = 0,
    East,
    South,
    West,
}

export enum GameFeature {
    GameProtocolChecksum = 1,
    GameAccountNames = 2,
    GameChallengeOnLogin = 3,
    GamePenalityOnDeath = 4,
    GameNameOnNpcTrade = 5,
    GameDoubleFreeCapacity = 6,
    GameDoubleExperience = 7,
    GameTotalCapacity = 8,
    GameSkillsBase = 9,
    GamePlayerRegenerationTime = 10,
    GameChannelPlayerList = 11,
    GamePlayerMounts = 12,
    GameEnvironmentEffect = 13,
    GameCreatureEmblems = 14,
    GameItemAnimationPhase = 15,
    GameMagicEffectU16 = 16,
    GamePlayerMarket = 17,
    GameSpritesU32 = 18,
    // 19 unused
    GameOfflineTrainingTime = 20,
    GamePurseSlot = 21,
    GameFormatCreatureName = 22,
    GameSpellList = 23,
    GameClientPing = 24,
    GameExtendedClientPing = 25,
    GameDoubleHealth = 28,
    GameDoubleSkills = 29,
    GameChangeMapAwareRange = 30,
    GameMapMovePosition = 31,
    GameAttackSeq = 32,
    GameBlueNpcNameColor = 33,
    GameDiagonalAnimatedText = 34,
    GameLoginPending = 35,
    GameNewSpeedLaw = 36,
    GameForceFirstAutoWalkStep = 37,
    GameMinimapRemove = 38,
    GameDoubleShopSellAmount = 39,
    GameContainerPagination = 40,
    GameThingMarks = 41,
    GameLooktypeU16 = 42,
    GamePlayerStamina = 43,
    GamePlayerAddons = 44,
    GameMessageStatements = 45,
    GameMessageLevel = 46,
    GameNewFluids = 47,
    GamePlayerStateU16 = 48,
    GameNewOutfitProtocol = 49,
    GamePVPMode = 50,
    GameWritableDate = 51,
    GameAdditionalVipInfo = 52,
    GameBaseSkillU16 = 53,
    GameCreatureIcons = 54,
    GameHideNpcNames = 55,
    GameSpritesAlphaChannel = 56,
    GamePremiumExpiration = 57,
    GameBrowseField = 58,
    GameEnhancedAnimations = 59,
    GameOGLInformation = 60,
    GameMessageSizeCheck = 61,
    GamePreviewState = 62,
    GameLoginPacketEncryption = 63,
    GameClientVersion = 64,
    GameContentRevision = 65,
    GameExperienceBonus = 66,
    GameAuthenticator = 67,
    GameUnjustifiedPoints = 68,
    GameSessionKey = 69,
    GameDeathType = 70,
    GameIdleAnimations = 71,
    GameKeepUnawareTiles = 72,
    GameIngameStore = 73,
    GameIngameStoreHighlights = 74,
    GameIngameStoreServiceType = 75,
    GameAdditionalSkills = 76,

    LastGameFeature = 101
}

export enum FrameGroupType {
    FrameGroupDefault = 0,
    FrameGroupIdle = FrameGroupDefault,
    FrameGroupMoving
}

export enum DatThingCategory {
    ThingCategoryItem = 0,
    ThingCategoryCreature,
    ThingCategoryEffect,
    ThingCategoryMissile,
    ThingInvalidCategory,
    ThingLastCategory = ThingInvalidCategory
}

export enum DatThingAttr {
    ThingAttrGround = 0,
    ThingAttrGroundBorder = 1,
    ThingAttrOnBottom = 2,
    ThingAttrOnTop = 3,
    ThingAttrContainer = 4,
    ThingAttrStackable = 5,
    ThingAttrForceUse = 6,
    ThingAttrMultiUse = 7,
    ThingAttrWritable = 8,
    ThingAttrWritableOnce = 9,
    ThingAttrFluidContainer = 10,
    ThingAttrSplash = 11,
    ThingAttrNotWalkable = 12,
    ThingAttrNotMoveable = 13,
    ThingAttrBlockProjectile = 14,
    ThingAttrNotPathable = 15,
    ThingAttrPickupable = 16,
    ThingAttrHangable = 17,
    ThingAttrHookSouth = 18,
    ThingAttrHookEast = 19,
    ThingAttrRotateable = 20,
    ThingAttrLight = 21,
    ThingAttrDontHide = 22,
    ThingAttrTranslucent = 23,
    ThingAttrDisplacement = 24,
    ThingAttrElevation = 25,
    ThingAttrLyingCorpse = 26,
    ThingAttrAnimateAlways = 27,
    ThingAttrMinimapColor = 28,
    ThingAttrLensHelp = 29,
    ThingAttrFullGround = 30,
    ThingAttrLook = 31,
    ThingAttrCloth = 32,
    ThingAttrMarket = 33,
    ThingAttrUsable = 34,
    ThingAttrWrapable = 35,
    ThingAttrUnwrapable = 36,
    ThingAttrTopEffect = 37,

    // additional
    ThingAttrOpacity = 100,
    ThingAttrNotPreWalkable = 101,

    ThingAttrFloorChange = 252,
    ThingAttrNoMoveAnimation = 253, // 10.10: real value is 16, but we need to do this for backwards compatibility
    ThingAttrChargeable = 254, // deprecated
    ThingLastAttr = 255
}

export enum OtbItemCategory {
    ItemCategoryInvalid = 0,
    ItemCategoryGround = 1,
    ItemCategoryContainer = 2,
    ItemCategoryWeapon = 3,
    ItemCategoryAmmunition = 4,
    ItemCategoryArmor = 5,
    ItemCategoryCharges = 6,
    ItemCategoryTeleport = 7,
    ItemCategoryMagicField = 8,
    ItemCategoryWritable = 9,
    ItemCategoryKey = 10,
    ItemCategorySplash = 11,
    ItemCategoryFluid = 12,
    ItemCategoryDoor = 13,
    ItemCategoryDeprecated = 14,
    ItemCategoryLast = 15
}

export enum OtbItemTypeAttr {
    ItemTypeAttrServerId = 16,
    ItemTypeAttrClientId = 17,
    ItemTypeAttrName = 18,   // deprecated
    ItemTypeAttrDesc = 19,   // deprecated
    ItemTypeAttrSpeed = 20,
    ItemTypeAttrSlot = 21,   // deprecated
    ItemTypeAttrMaxItems = 22,   // deprecated
    ItemTypeAttrWeight = 23,   // deprecated
    ItemTypeAttrWeapon = 24,   // deprecated
    ItemTypeAttrAmmunition = 25,   // deprecated
    ItemTypeAttrArmor = 26,   // deprecated
    ItemTypeAttrMagicLevel = 27,   // deprecated
    ItemTypeAttrMagicField = 28,   // deprecated
    ItemTypeAttrWritable = 29,   // deprecated
    ItemTypeAttrRotateTo = 30,   // deprecated
    ItemTypeAttrDecay = 31,   // deprecated
    ItemTypeAttrSpriteHash = 32,
    ItemTypeAttrMinimapColor = 33,
    ItemTypeAttr07 = 34,
    ItemTypeAttr08 = 35,
    ItemTypeAttrLight = 36,
    ItemTypeAttrDecay2 = 37,   // deprecated
    ItemTypeAttrWeapon2 = 38,   // deprecated
    ItemTypeAttrAmmunition2 = 39,   // deprecated
    ItemTypeAttrArmor2 = 40,   // deprecated
    ItemTypeAttrWritable2 = 41,   // deprecated
    ItemTypeAttrLight2 = 42,
    ItemTypeAttrTopOrder = 43,
    ItemTypeAttrWrtiable3 = 44,   // deprecated
    ItemTypeAttrWareId = 45,
    ItemTypeAttrLast = 46
}

export enum SpriteMask {
    SpriteMaskRed = 1,
    SpriteMaskGreen,
    SpriteMaskBlue,
    SpriteMaskYellow
}
