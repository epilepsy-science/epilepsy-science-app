<template>
  <div>
    <NotebooksHero label="Notebooks" title="Compute" tab="compute">
      Every notebook runs on a Pennsieve compute node: AWS resources that Pennsieve sets up, runs and cleans up for
      you. Start on ours, or run them in your own AWS account.
    </NotebooksHero>

  <section class="page">
    <!-- Signed in: the way to the user's own nodes and accounts. -->
    <div v-if="session.signedIn" class="mine">
      <div>
        <strong>My compute</strong>
        <span>Your compute nodes and connected AWS accounts: their status, new nodes, and removing them.</span>
      </div>
      <el-button type="primary" @click="router.push('/notebooks/compute/mine')">Open My compute</el-button>
    </div>

    <div class="options">
      <article class="option">
        <span class="tag">Default</span>
        <h2>Pennsieve Shared Compute Node</h2>
        <p>Run by Pennsieve, ready the moment you sign in. Ideal for exploring a dataset and trying out an idea.</p>
        <ul>
          <li>Nothing to set up</li>
          <li v-for="limit in SHARED_NODE.limits" :key="limit">{{ limit }}</li>
        </ul>
        <el-button type="primary" @click="router.push('/notebooks/new')">Start a notebook</el-button>
      </article>

      <article class="option">
        <span class="tag own">Your own AWS account</span>
        <h2>Your own compute node</h2>
        <p>
          Connect your AWS account and Pennsieve creates a compute node in it. You pay AWS directly, and only you use it.
        </p>
        <ul>
          <li>Not shared with anyone else</li>
          <li>No daily limit, larger sizes, several notebooks at once</li>
          <li>Your AWS credits and billing</li>
          <li>Pennsieve manages the node for you</li>
          <li>{{ OWN_NODE_IDLE }}; you pay for notebooks only while they run</li>
          <li>Easy to remove: a few clicks, and nothing is left behind</li>
        </ul>
        <el-button @click="router.push('/notebooks/compute/connect')">Connect your AWS account</el-button>
      </article>
    </div>

    <h2 class="section-title">How connecting your AWS account works</h2>
    <div class="es-heading-bar"><i></i></div>
    <ol class="how">
      <li>
        <strong>Connect.</strong>
        Enter your AWS account ID and open a CloudFormation stack in the AWS console. It creates a role that lets Pennsieve
        manage compute in that account, and nothing else.
      </li>
      <li>
        <strong>Create a node.</strong>
        Give it a name. Pennsieve builds the node in your account; this takes a few minutes.
      </li>
      <li>
        <strong>Use it.</strong>
        Your node appears next to the shared node when you start a notebook. While nothing runs, it costs less than $5
        a month in your AWS account.
      </li>
      <li>
        <strong>Remove it whenever you like.</strong>
        Delete the node and disconnect the account in
        <NuxtLink :to="'/notebooks/compute/mine'">My compute</NuxtLink>, then delete the CloudFormation stack in your AWS
        console. Nothing of Pennsieve's is left in your account.
      </li>
    </ol>

  </section>
  </div>
</template>

<script setup>
import { OWN_NODE_IDLE, SHARED_NODE } from "@/utils/computeBrand";
import { useVisitorStore } from "@/store/visitor";

const router = useRouter();
const session = useVisitorStore();
</script>

<style lang="scss" scoped>
.page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px 64px;
}

// The signed-in visitor's way to My compute, above the two options.
.mine {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin: 0 0 32px;
  padding: 20px 24px;
  border: 1px solid $es-border;
  border-left: 4px solid $es-primary;
  border-radius: $es-radius;
  background: #fff;

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  strong {
    color: $es-black;
    font-weight: 600;
  }

  span {
    color: #555;
    font-size: 0.95rem;
    line-height: 1.5;
  }
}

.options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin: 0 0 56px;
}

.option {
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 28px;
  border: 1px solid $es-border;
  border-radius: $es-radius;
  background: #fff;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.4;
  }

  p {
    margin: 0;
    color: #333;
    line-height: 1.6;
  }

  ul {
    margin: 0 0 8px;
    padding-left: 20px;
    color: #333;
    line-height: 1.8;
  }

  .el-button {
    justify-self: start;
    margin-top: 4px;
  }
}

// As the site's labels: small, uppercase, teal.
.tag {
  justify-self: start;
  color: $es-teal;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;

  &.own {
    color: $es-black;
  }
}

.section-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
  text-transform: uppercase;
}

.es-heading-bar {
  margin-bottom: 24px;
}

// The steps, numbered in teal squares like the site's heading bar.
.how {
  display: grid;
  gap: 16px;
  margin: 0 0 56px;
  padding: 0;
  list-style: none;
  counter-reset: step;

  li {
    position: relative;
    padding: 16px 20px 16px 64px;
    border: 1px solid $es-border;
    border-radius: $es-radius;
    color: #333;
    line-height: 1.6;
    counter-increment: step;

    &::before {
      content: counter(step);
      position: absolute;
      top: 16px;
      left: 20px;
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      border-radius: $es-radius-sm;
      background: $es-primary;
      color: #fff;
      font-weight: 600;
      font-size: 0.9rem;
    }
  }

  strong {
    color: $es-black;
    font-weight: 600;
  }
}

@media (max-width: 600px) {
  .mine {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
