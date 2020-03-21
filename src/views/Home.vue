<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/image/heima.png" alt="heima">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isMenuCollapsed ? '64px' : '200px'">
        <div class="menu-toggle-btn" @click="isMenuCollapsed = !isMenuCollapsed">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isMenuCollapsed"
          :collapse-transition="false"
          router
          :default-active="$route.path"> <!-- 刷新页面后可以默认展开并高亮指定菜单 -->
          <el-submenu :index="String(index)" v-for="(menu, index) in menuList" :key="menu.id">
            <template slot="title">
              <i :class="`iconfont icon-${menu.path}`"></i>
              <span>{{ menu.authName }}</span>
            </template>
            <el-menu-item :index="`/${subMenu.path}`" v-for="subMenu in menu.children" :key="subMenu.id">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subMenu.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  created () {
    this.getMenuList()
  },
  data () {
    return {
      menuList: [],
      isMenuCollapsed: false
    }
  },
  methods: {
    logout () {
      sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.error(`获取菜单失败：${res.meta.msg}`)
      }
      this.menuList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;
    > div {
      color: #fff;
      font-size: 20px;
      display: flex;
      align-items: center;
      > span {
        margin-left: 16px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
    user-select: none;
    .menu-toggle-btn {
      color: #fff;
      background-color: #4a5064;
      text-align: center;
      font-size: 12px;
      line-height: 25px;
      letter-spacing: .2em;
      cursor: pointer;
    }
    .el-menu {
      border-right-style: none;
      .iconfont {
        margin-right: 10px;
      }
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
}
</style>
