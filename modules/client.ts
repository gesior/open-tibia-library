import {GameFeature} from "./constants/const";

export class Client {
    m_clientVersion = 0;
    m_features: boolean[] = [];

    getClientVersion(): number {
        return this.m_clientVersion;
    }

    setClientVersion(version: number) {
        this.m_clientVersion = version;
        this.updateFeatures(version);
    }

    enableFeature(feature: GameFeature) {
        this.m_features[feature] = true;
    }

    disableFeature(feature: GameFeature) {
        this.m_features[feature] = false;
    }

    getFeature(feature: GameFeature): boolean {
        return this.m_features[feature] == true;
    }

    updateFeatures(version: number) {
        this.m_features = [];
        this.enableFeature(GameFeature.GameFormatCreatureName);

        if (version >= 770) {
            this.enableFeature(GameFeature.GameLooktypeU16);
            this.enableFeature(GameFeature.GameMessageStatements);
            this.enableFeature(GameFeature.GameLoginPacketEncryption);
        }

        if (version >= 780) {
            this.enableFeature(GameFeature.GamePlayerAddons);
            this.enableFeature(GameFeature.GamePlayerStamina);
            this.enableFeature(GameFeature.GameNewFluids);
            this.enableFeature(GameFeature.GameMessageLevel);
            this.enableFeature(GameFeature.GamePlayerStateU16);
            this.enableFeature(GameFeature.GameNewOutfitProtocol);
        }

        if (version >= 790) {
            this.enableFeature(GameFeature.GameWritableDate);
        }

        if (version >= 840) {
            this.enableFeature(GameFeature.GameProtocolChecksum);
            this.enableFeature(GameFeature.GameAccountNames);
            this.enableFeature(GameFeature.GameDoubleFreeCapacity);
        }

        if (version >= 841) {
            this.enableFeature(GameFeature.GameChallengeOnLogin);
            this.enableFeature(GameFeature.GameMessageSizeCheck);
        }

        if (version >= 854) {
            this.enableFeature(GameFeature.GameCreatureEmblems);
        }

        if (version >= 860) {
            this.enableFeature(GameFeature.GameAttackSeq);
        }

        if (version >= 862) {
            this.enableFeature(GameFeature.GamePenalityOnDeath);
        }

        if (version >= 870) {
            this.enableFeature(GameFeature.GameDoubleExperience);
            this.enableFeature(GameFeature.GamePlayerMounts);
            this.enableFeature(GameFeature.GameSpellList);
        }

        if (version >= 910) {
            this.enableFeature(GameFeature.GameNameOnNpcTrade);
            this.enableFeature(GameFeature.GameTotalCapacity);
            this.enableFeature(GameFeature.GameSkillsBase);
            this.enableFeature(GameFeature.GamePlayerRegenerationTime);
            this.enableFeature(GameFeature.GameChannelPlayerList);
            this.enableFeature(GameFeature.GameEnvironmentEffect);
            this.enableFeature(GameFeature.GameItemAnimationPhase);
        }

        if (version >= 940) {
            this.enableFeature(GameFeature.GamePlayerMarket);
        }

        if (version >= 953) {
            this.enableFeature(GameFeature.GamePurseSlot);
            this.enableFeature(GameFeature.GameClientPing);
        }

        if (version >= 960) {
            this.enableFeature(GameFeature.GameSpritesU32);
            this.enableFeature(GameFeature.GameOfflineTrainingTime);
        }

        if (version >= 963) {
            this.enableFeature(GameFeature.GameAdditionalVipInfo);
        }

        if (version >= 980) {
            this.enableFeature(GameFeature.GamePreviewState);
            this.enableFeature(GameFeature.GameClientVersion);
        }

        if (version >= 981) {
            this.enableFeature(GameFeature.GameLoginPending);
            this.enableFeature(GameFeature.GameNewSpeedLaw);
        }

        if (version >= 984) {
            this.enableFeature(GameFeature.GameContainerPagination);
            this.enableFeature(GameFeature.GameBrowseField);
        }

        if (version >= 1000) {
            this.enableFeature(GameFeature.GameThingMarks);
            this.enableFeature(GameFeature.GamePVPMode);
        }

        if (version >= 1035) {
            this.enableFeature(GameFeature.GameDoubleSkills);
            this.enableFeature(GameFeature.GameBaseSkillU16);
        }

        if (version >= 1036) {
            this.enableFeature(GameFeature.GameCreatureIcons);
            this.enableFeature(GameFeature.GameHideNpcNames);
        }

        if (version >= 1038) {
            this.enableFeature(GameFeature.GamePremiumExpiration);
        }

        if (version >= 1050) {
            this.enableFeature(GameFeature.GameEnhancedAnimations);
        }

        if (version >= 1053) {
            this.enableFeature(GameFeature.GameUnjustifiedPoints);
        }

        if (version >= 1054) {
            this.enableFeature(GameFeature.GameExperienceBonus);
        }

        if (version >= 1055) {
            this.enableFeature(GameFeature.GameDeathType);
        }

        if (version >= 1057) {
            this.enableFeature(GameFeature.GameIdleAnimations);
        }

        if (version >= 1061) {
            this.enableFeature(GameFeature.GameOGLInformation);
        }

        if (version >= 1071) {
            this.enableFeature(GameFeature.GameContentRevision);
        }

        if (version >= 1072) {
            this.enableFeature(GameFeature.GameAuthenticator);
        }

        if (version >= 1074) {
            this.enableFeature(GameFeature.GameSessionKey);
        }

        if (version >= 1080) {
            this.enableFeature(GameFeature.GameIngameStore);
        }

        if (version >= 1092) {
            this.enableFeature(GameFeature.GameIngameStoreServiceType);
        }

        if (version >= 1093) {
            this.enableFeature(GameFeature.GameIngameStoreHighlights);
        }

        if (version >= 1094) {
            this.enableFeature(GameFeature.GameAdditionalSkills);
        }
    }

}