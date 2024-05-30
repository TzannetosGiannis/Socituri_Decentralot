module decentralot::config {
    
    // === Imports ===
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::event::emit;
    use sui::transfer;

    // === Errors ===
    const EFeeAboveMax: u64 = 1;
    const ERefundPctAboveMax: u64 = 2;
    const EPackageVersionMissmatch: u64 = 3;

    // === Constants ===
    const MAX_FEE_BPS: u64 = 300; // 3%
    const INIT_FEE_BPS: u64 = 200; // 2%
    const MAX_REFUND_PCT: u64 = 9000; // 90%
    const INIT_REFUND_PCT: u64 = 7000; // 70%

    const VERSION: u64 = 1;

    // === Structs ===
    struct AdminCap has key, store {
        id: UID,
    }
    
    struct Config has key, store {
        id: UID,
        protocol_fee_bps: u64,
        refund_pct_bps: u64,
        package_version: u64,
    }

    // === Events ===
    struct UpdateProtocolFeeRate has copy, drop {
        old_fee_bps: u64,
        new_fee_bps: u64,
    }

    struct UpdateProtocolRefundPercentage has copy, drop {
        old_pct_bps: u64,
        new_pct_bps: u64,
    }

    struct UpdatePackageVersion has copy, drop {
        new_version: u64,
    }

    // === Public Functions ===
    fun init(ctx: &mut TxContext) {
        let config = Config {
            id: object::new(ctx),
            protocol_fee_bps: INIT_FEE_BPS,
            refund_pct_bps: INIT_REFUND_PCT,
            package_version: VERSION
        };

        let admin_cap = AdminCap {
            id: object::new(ctx)
        };


    
        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(config);
    }

    // === Admin Functions ===
    public fun set_protocol_fee_bps(_: &AdminCap, config: &mut Config, new_fee_bps: u64) {
        assert_version(config);

        assert!(new_fee_bps <= MAX_FEE_BPS, EFeeAboveMax);
        let old_fee_bps = config.protocol_fee_bps;
        config.protocol_fee_bps = new_fee_bps;

        emit(UpdateProtocolFeeRate {
            old_fee_bps,
            new_fee_bps,
        })
    }

    public fun set_protocol_refund_bps(_: &AdminCap, config: &mut Config, new_refund_pct_bps: u64) {
        assert_version(config);
        
        assert!(new_refund_pct_bps <= MAX_REFUND_PCT, ERefundPctAboveMax);
        let old_refund_pct_bps = config.refund_pct_bps;
        config.refund_pct_bps = new_refund_pct_bps;

        emit(UpdateProtocolRefundPercentage {
            old_pct_bps: old_refund_pct_bps,
            new_pct_bps: new_refund_pct_bps,
        })
    }

    public fun update_package_version(_: &AdminCap, config: &mut Config) {
        let new_version = config.package_version + 1;
        config.package_version = new_version;
        emit(UpdatePackageVersion {
            new_version
        });
    }

    public fun assert_version(config: &Config) {
        assert!(VERSION == config.package_version, EPackageVersionMissmatch);
    }

    // === View Functions ===
    public fun protocol_fee_bps(config: &Config): u64 {
        config.protocol_fee_bps
    }

    public fun refund_pct_bps(config: &Config): u64 {
        config.refund_pct_bps
    }

    public fun max_protocol_fee_bps(): u64 {
        MAX_FEE_BPS
    }

    public fun version(): u64 {
        VERSION
    }
}