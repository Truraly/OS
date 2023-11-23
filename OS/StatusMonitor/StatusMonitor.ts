
/**
 * 状态监控器抽象类
 */

export abstract class StatusMonitor {
    /**
     * 获取状态
     */
    abstract getStatus(): string;
    /**
     * 初始化
     */
    abstract init(): boolean;
    /**
     * 获取表头
     */
    abstract getHead(): string;
}
