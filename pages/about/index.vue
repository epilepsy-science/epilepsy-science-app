<template>
  <div class="about-page">
    <section class="mission-section es-dots">
      <div class="mission-inner">
        <p class="es-label">About</p>
        <h1 class="mission-title">{{ content.mission.title }}</h1>
        <div class="es-heading-bar centered"><i></i></div>
      </div>
    </section>

    <div class="about-body">
      <section class="panel what-we-do-section">
        <h2 class="section-title">{{ content.whatWeDo.title }}</h2>
        <div class="two-col">
          <p v-for="(text, index) in content.whatWeDo.textItems" :key="index" class="text-section">
            {{ text }}
          </p>
        </div>
      </section>

      <section class="panel mission-details-section">
        <h2 class="section-title">{{ content.missionDetails.title }}</h2>
        <p class="section-subtitle">{{ content.missionDetails.subtitle }}</p>
        <div class="content-container">
          <div class="text-column">
            <p class="bold-text mb-8">{{ content.missionDetails.additionalInfo }}</p>
            <p class="mb-8">{{ content.missionDetails.introduction }}</p>
            <p class="bold-text mb-8">{{ content.missionDetails.highlightsTitle }}</p>
            <ul class="highlights">
              <li v-for="(highlight, index) in content.missionDetails.highlights" :key="index">
                {{ highlight }}
              </li>
            </ul>
            <p class="bold-text">{{ content.missionDetails.footer }}</p>
          </div>
          <div class="image-column">
            <img :src="content.missionDetails.imageSrc" alt="Epilepsy data platform" />
          </div>
        </div>
      </section>

      <section class="collaboration-section">
        <div class="section-heading">
          <p class="es-label">Partners</p>
          <h2 class="section-title">{{ collaboratorSectionContent.title }}</h2>
          <p class="collaboration-subtitle">{{ collaboratorSectionContent.subtitle }}</p>
        </div>
        <div class="cards-grid">
          <CollaboratorCard
            v-for="(card, index) in collaboratorSectionContent.cards"
            :key="index"
            :title="card.title"
            :description="card.description"
            :link="card.link"
          />
        </div>
      </section>

      <section class="team-section">
        <Team />
      </section>
    </div>
  </div>
</template>

<script setup>
import {
  aboutPageContent,
  aboutCollaboratorsContent,
} from "../../assets/content/aboutPageContent";
import { ref } from "vue";
import Team from "./team/team.vue";

useBreadcrumb([{ label: "About" }]);
const content = ref(aboutPageContent);
const collaboratorSectionContent = ref(aboutCollaboratorsContent);

</script>

<style scoped lang="scss">
.mission-section {
  border-bottom: 1px solid $es-border;

  .mission-inner {
    max-width: 900px;
    margin: 0 auto;
    padding: 72px 20px 56px;
    text-align: center;
  }

  .es-label { margin: 0 0 16px; }

  .mission-title {
    margin: 0;
    font-size: 2.1rem;
    line-height: 1.3;
    font-weight: 500;
    color: #000;
    text-transform: none;
  }

  .es-heading-bar { margin-top: 20px; }
}

.about-body {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 20px 72px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.panel {
  background: #fff;
  border: 1px solid $es-border;
  border-radius: $es-radius;
  padding: 40px;
}

.section-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 500;
  text-transform: uppercase;
  text-align: center;
}

.what-we-do-section {
  .two-col {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
    margin-top: 24px;
  }

  .text-section {
    margin: 0;
    line-height: 1.65;
    color: #333;
  }
}

.mission-details-section {
  .section-subtitle {
    max-width: 800px;
    margin: 12px auto 32px;
    line-height: 1.6;
    color: #333;
    text-align: center;
  }

  .content-container {
    display: flex;
    gap: 40px;
    align-items: flex-start;
  }

  .text-column {
    flex: 1;
    line-height: 1.6;
    color: #333;

    .bold-text { font-weight: 600; color: #000; }
    .highlights {
      padding-left: 20px;
      li { margin-bottom: 8px; }
    }
  }

  .image-column {
    flex: 0 0 280px;

    img {
      width: 100%;
      border: 1px solid $es-border;
      border-radius: $es-radius-sm;
    }
  }
}

.collaboration-section {
  .section-heading {
    text-align: center;
    margin-bottom: 24px;

    .es-label { margin: 0 0 8px; }
    .collaboration-subtitle { margin: 8px 0 0; color: $es-teal; font-weight: 600; }
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .mission-section .mission-title { font-size: 1.5rem; }
  .about-body { padding: 32px 16px 48px; gap: 32px; }
  .panel { padding: 24px; }
  .what-we-do-section .two-col,
  .collaboration-section .cards-grid { grid-template-columns: 1fr; }
  .mission-details-section .content-container { flex-direction: column; }
  .mission-details-section .image-column { flex: none; width: 100%; }
}
</style>
